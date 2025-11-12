import { isLocalhost } from "./common.js"

const API_DOMAIN = 'https://all-the-ponies-api.vercel.app/'

const LOCALHOST_API_DOMAIN = (() => {
    const url = new URL(location.origin)
    url.port = '5501'
    return url.origin
})()

async function request(pathname, query = {}) {
    let url, response
    url = new URL(isLocalhost() ? LOCALHOST_API_DOMAIN : API_DOMAIN)
    url.pathname = pathname
    for (let [key, value] of query) {
        url.searchParams.set(key, value)
    }
    
    if (isLocalhost()) {
        response = await fetch(String(url)).catch(err => console.warn(err) || null)
        if (response !== null) {
            return response
        }

        url.origin = API_DOMAIN
    }

    response = await fetch(String(url))

    return response
}

async function getShop() {
    const url = new URL(API_DOMAIN)
    url.pathname = `/sales/shop/`

    const result = (await fetch(url.toString())).json()

    return result
}

async function getSave(friendCode) {
    const url = new URL(API_DOMAIN)
    url.pathname = `/save/${friendCode.toLowerCase().trim()}/inventory/`

    const result = (await fetch(url.toString())).json()

    return result
}


export default {
    API_DOMAIN,
    getSave,
    getShop,
}
