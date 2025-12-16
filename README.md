# All The Ponies

> [!IMPORTANT]
> This project has been archived because of my rewrite, which can be found [here](https://github.com/all-the-ponies/all-the-ponies.github.io)

Can you name all the ponies in the mlp gameloft game?

This is (or will be) a game where you try to name as many mlp gameloft ponies. There will also be some more stuff, like extra pony info, wiki checker (to see which ponies aren't on the wiki or the title is different from the in-game name), and maybe also a pony checklist.

## Development

For development, first install the dependencies

```shell
pip install -r requirements.txt
```

Then start the local web server by running

```shell
python local_server.py
```

I mainly just created this because the live server vscode extension I was using (Five Server) doesn't handle query parameters after a slash, the reloading was getting a little annoying, and most importantly, it did not support custom 404 pages (which I need). The default python `http.server` script does handle query parameters after a slash, but it also makes the browser always use the cache, which is bad for development (I'd have to clear the cache every time I want to see a change). While it didn't support a custom 404 page by default, I was able to create my own script to handle that. As for the caching, well, I was also able to get rid of that, both the browser caching responses, and also caching linked .js and .css files.

TLDR; I wasn't happy with the existing tools for a local web server, so I modified the default python `http.server` one to make it actually decent for development, and support custom 404 pages.

## Credits

- Gameloft for adding over 2000 ponies to the mobile game so I can just write a script to get them all.
- [Celestia Medium Redux font](http://www.mattyhex.net/CMR/)

---

All characters in the My Little Pony franchise belong to Hasbro, and all
