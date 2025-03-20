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
  path: () => `/dashboard/flows`,
};

export const FlowBuilderRoute = {
  path: (id: string) => `/builder/chat-flow/${id}`,
};

export const AuthenticationRoute = {
  path: () => `/dashboard/auth`,
};

export const LogoutRoute = {
  path: () => `/logout`,
};

export const LoginRoute = {
  path: () => `/login`,
};
