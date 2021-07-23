![SVG Crop](src/images/twitter.png)

## Remove blank space from around any SVG instantly.

### Contributions

Open up an issue! Then:

- Clone and run `yarn && yarn start:dev` 
- Submit a PR (I can then build and deploy it on my end)

Note that I've started the process of converting the components to TypeScript.

### Developing with `https`
For the PWA to work correctly in development, the site must be served in a secure context.
To run the application in a secure context:
1. Install [mkcert](https://github.com/FiloSottile/mkcert) & follow the instructions for installing a local certificate authority.
2. Run `yarn gen:cert`
3. `yarn dev:https`
4. 💵