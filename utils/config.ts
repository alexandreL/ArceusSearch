const dev = process.env.NODE_ENV !== 'production'

export const server_url = dev ? 'http://localhost:2222' : 'https://arceus.intra.helixyr.fr'
