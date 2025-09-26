import { isLocalhost } from "./common.js"

const API_DOMAIN = !isLocalhost()
    ? 'https://all-the-ponies-api.vercel.app/'
    : (() => {
        const url = new URL(location.origin)
        url.port = '5501'
        return url.origin
    })()

async function getShop() {
    const url = new URL(API_DOMAIN)
    url.pathname = `/sales/shop/`

    const result = (await fetch(url.toString())).json()

    return result
}

async function getSave(friendCode) {
    const url = new URL(API_DOMAIN)
    url.pathname = `/save/${friendCode.toLowerCase().trim()}/`

    const result = (await fetch(url.toString())).json()

    return result
}


export default {
    API_DOMAIN,
    getSave,
    getShop,
}
