import { parsedEnv } from 'environment'
import { app as server } from 'app'

server
  .listen({
    port: parsedEnv.PORT,
  })
  .then(() => {
    console.log(`HTTP Server running on port ${parsedEnv.PORT} ⊱🚀`)
  })
