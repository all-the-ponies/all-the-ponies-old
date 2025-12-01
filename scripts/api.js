import { isLocalhost } from "./common.js"

const API_DOMAIN = 'https://all-the-ponies-api.vercel.app/'

const LOCALHOST_API_DOMAIN = (() => {
    const url = new URL(location.origin)
    url.port = '5501'
    return url.origin
})()

async function request(pathname, query = {}) {
    let url, response

    function createUrl(localhost = false) {
        let url = new URL(localhost ? LOCALHOST_API_DOMAIN : API_DOMAIN)
        url.pathname = pathname
        for (let [key, value] of Object.entries(query)) {
            url.searchParams.set(key, value)
        }

        return url
    }

    url = createUrl(isLocalhost())

    
    if (isLocalhost()) {
        response = await fetch(String(url)).catch(err => console.warn(err) || null)
        if (response !== null) {
            return response
        }

        url = createUrl(false)
    }

    response = await fetch(String(url))

    return response
}

async function getShop() {
    const result = (await request(`/sales/shop/`)).json()

    return result
}

async function getSave(friendCode) {
    const result = (await request(`/save/${friendCode.toLowerCase().trim()}/inventory/`)).json()

    return result
}


export default {
    API_DOMAIN,
    getSave,
    getShop,
}
