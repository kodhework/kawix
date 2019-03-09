
import Fastify from 'npm://fastify@^2.0.0'

const fastify= Fastify()
const schema = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          hello: {
            type: 'string'
          }
        }
      }
    }
  }
}

fastify.get('/', function (req, reply) {
  reply.send({ hello: 'world' })
})

fastify.listen(3000)

/* IN MY DEV MACHINE: 
Running 40s test @ http://localhost:8181
100 connections with 10 pipelining factor

┌─────────┬──────┬──────┬───────┬───────┬─────────┬─────────┬───────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%   │ Avg     │ Stdev   │ Max       │
├─────────┼──────┼──────┼───────┼───────┼─────────┼─────────┼───────────┤
│ Latency │ 0 ms │ 0 ms │ 27 ms │ 33 ms │ 3.27 ms │ 8.33 ms │ 227.88 ms │
└─────────┴──────┴──────┴───────┴───────┴─────────┴─────────┴───────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 14519   │ 14519   │ 29999   │ 33247   │ 29415.1 │ 3005.85 │ 14518   │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 2.38 MB │ 2.38 MB │ 4.92 MB │ 5.45 MB │ 4.82 MB │ 493 kB  │ 2.38 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

1177k requests in 40.08s, 193 MB read
 */