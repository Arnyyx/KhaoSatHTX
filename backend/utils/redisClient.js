import { createClient } from 'redis'

const client = createClient({
    url: process.env.REDIS_URL,
})

client.on('error', (err) => {
    console.error('Redis Client Error', err)
})

if (!client.isOpen) {
    client.connect().catch(console.error)
}

export default client
