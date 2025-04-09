import { Client } from "pg";
import { Result } from "typescript-result";
import { z } from "zod";
import { CryptoService } from "../services/secret/crypto-service";
import { logger } from "../utils/logger";
import { PostgresQuery, Tool, ToolOptions } from "./tool.interface";

const defaultName = "postgres-query-tool";

function toSafePgQuery(
  template: string,
  variables: { name: string; value: string }[],
): {
  query: string;
  values: string[];
} {
  const paramOrder: string[] = [];
  const seen = new Set<string>();

  // Replace all {{variable}} with $1, $2, etc.
  const query = template.replace(/{{\s*(\w+)\s*}}/g, (_, varName) => {
    if (!seen.has(varName)) {
      paramOrder.push(varName);
      seen.add(varName);
    }
    const index = paramOrder.indexOf(varName) + 1;
    return `$${index}`;
  });

  // Create values array in order
  const values = paramOrder.map((name) => {
    const found = variables.find((v) => v.name === name);
    if (!found) {
      throw new Error(`Missing value for variable "${name}"`);
    }
    return found.value;
  });

  return { query, values };
}

export class PostgresQueryTool implements Tool<"postgres-query-tool"> {
  readonly type = "postgres-query-tool";
  readonly id: string;
  private options: ToolOptions;
  private cryptoService: CryptoService;
  private databaseUrl: string;

  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;

  constructor(
    private definition: PostgresQuery,
    options: ToolOptions,
  ) {
    const baseDescription = `This tool allows to query a postgres database. 
    The user already wrote a SQL query for you and you only have to execute the tool.
    It is possible that the tool does or does not need variables values to be replaced in the query.
    
    Here are the expected parameters:

    ---
    ${definition.config.variables.map((v) => `${v.name}: ${v.description}`).join("\n")}
    ---

    For each parameter, you will define the value yourself based on the user's request.

    ${definition.description ? `Here is also an additional instruction provided by the user: ${definition.description}` : ""}
    `;

    this.id = definition.id;
    this.name = definition.name || defaultName;
    this.description = baseDescription;

    this.schema = z.object({
      variables: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        }),
      ),
    });

    this.options = options;

    this.cryptoService = new CryptoService();

    if (!definition.config.apiKey) {
      throw new Error("Api Key (aka Database URL) is required");
    }

    const [decryptedDatabaseUrlResult, decryptedDatabaseUrlError] =
      this.cryptoService.decrypt(definition.config.apiKey).toTuple();

    if (decryptedDatabaseUrlError) {
      throw decryptedDatabaseUrlError;
    }

    this.databaseUrl = decryptedDatabaseUrlResult;
  }

  async run(
    params: z.infer<typeof this.schema>,
  ): Promise<Result<string, Error>> {
    try {
      logger.debug(
        `running ${this.name} PostgresQueryTool: ${JSON.stringify(params)}`,
      );

      logger.debug("DATABASE URL", this.databaseUrl);
      console.log("DB URL", this.databaseUrl);

      console.log("PARAMS", params);

      const client = new Client({
        connectionString: this.databaseUrl,
        ssl: false,
      });

      try {
        await client.connect();
      } catch (error) {
        return Result.error(
          new Error(`Failed to connect to database: ${error}`),
        );
      }

      try {
        const { query: safeQuery, values: safeValues } = toSafePgQuery(
          this.definition.config.query,
          params.variables,
        );

        const result = await client.query(safeQuery, safeValues);

        await client.end();
        return Result.ok(
          JSON.stringify({
            rows: result.rows,
            rowCount: result.rowCount,
          }),
        );
      } catch (error) {
        await client.end();
        return Result.error(new Error(`Failed to query database: ${error}`));
      }
    } catch (error) {
      return Result.error(
        new Error(`Failed to run PostgresQueryTool: ${error}`),
      );
    }
  }
}
