const usernameProps = {
  type: "string",
  minLength: 6,
  maxLength: 24
}

const emailProps = {
  type: "string",
  format: "email"
}

const passwordProps = {
  type: "string",
  minLength: 8
}

const userSchemas = {
  create: {
    body: {
      type: "object",
      properties: {
        username: usernameProps,
        email: emailProps,
        password: passwordProps,
      },
      additionalProperties: false,
      required: ["username", "password", "email"],
    },
  },
  updateById: {
    body: {
      type: "object",
      properties: {
        username: usernameProps,
        email: emailProps,
        password: passwordProps
      },
      additionalProperties: false
    }
  }
};

export default userSchemas;
