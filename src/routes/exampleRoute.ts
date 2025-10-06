
import { FastifyInstance } from "fastify";
import { ReplyDefault } from "fastify/types/utils.js";

//@TODO - find out how to type the request/reply
export default async function exampleRoute(app: FastifyInstance) {
  app.get("/exampleRoute", async (_request: any, reply: ReplyDefault) => {
    return { data: "some data" };
  });

  //@TODO - look at serialisation (~50 min) and type box
  const postSchema = {
    schema: {
        body: {
            type: 'object',
            properties: {
                label: { type: 'string' },
                value: { type: 'number' }
            }, 
            required: ['label', 'value']
        }
    }
  }


  app.post('/exampleRoute', postSchema, async (request: any, reply: ReplyDefault) => {
    const { label, value } = request.body

    // ...db query...

    return { label, value }

  })
}
