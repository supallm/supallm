import { FC, SVGProps } from "react";

export const Auth0Logo: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      height="30"
      {...props}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <path
        fill="#e45223"
        d="M12.549 1h-4.55l1.407 4.38h4.548l-3.68 2.61 1.406 4.405c2.37-1.725 3.143-4.336 2.274-7.016L12.55 1zM2.045 5.38h4.55L8 1H3.45L2.045 5.38c-.868 2.68-.094 5.29 2.275 7.015L5.725 7.99l-3.68-2.612zm2.275 7.015L8 15l3.68-2.605L8 9.745l-3.68 2.65z"
      />
    </svg>
  );
};
