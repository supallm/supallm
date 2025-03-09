export const OverviewRoute = {
  path: () => `/dashboard/overview`,
};

export const CredentialsRoute = {
  path: () => `/dashboard/credentials`,
};

export const NoProjectRoute = {
  path: () => `/new-project`,
};

export const ModelsRoute = {
  path: () => `/dashboard/models`,
};

export const ChatFlowsRoute = {
  path: () => `/dashboard/chat-flows`,
};

export const FlowBuilderRoute = {
  path: (id: string) => `/builder/chat-flow/${id}`,
};
