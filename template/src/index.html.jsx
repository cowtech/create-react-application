require('./images/favicon.png');
require('./manifest.json');
require('./robots.txt');

import * as React from "react";
import ReactDOMServer from "react-dom/server";

const structuredData = {

};

const index = ReactDOMServer.renderToStaticMarkup(
  <html>
    <head>
      <title>{env.title}</title>
      <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
      <meta charSet="utf8"/>
      <meta name="description" content={env.description}/>
      <meta name="keywords" content={env.keywords}/>
      <meta name="author" content={env.author}/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <meta name="apple-mobile-web-app-capable" content="yes"/>
      <meta name="theme-color" content="#000000"/>
      <link rel="icon" href="/images/favicon.png" sizes="32x32"/>
      <link rel="shortcut icon" href="images/favicon.png" sizes="196x196"/>
      <link rel="manifest" href="/manifest.json"/>

      {env.environment === 'production' && <style dangerouslySetInnerHTML={{__html: require('./css/main.scss').toString()}}/>}
      {env.environment === 'development' && <script defer={true} type="text/javascript" src="/webpack-bootstrap.js"></script>}
      <script defer={true} type="text/javascript" src="/js/app.js"></script>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}}/>
      <meta property="og:url" content=""/>
      <meta property="og:type" content="profile"/>
      <meta property="og:title" content={env.title}/>
      <meta property="og:description" content={env.description}/>
      <meta property="og:image" content=""/>
      <meta property="og:image:width" content="250"/>
      <meta property="og:image:height" content="250"/>
      <meta property="og:image:alt" content={env.description}/>
      <meta property="og:locale" content="it"/>
      <meta property="og:type" content="profile"/>
      <meta property="fb:app_id" content=""/>
      <meta property="fb:profile_id" content=""/>
      <meta name="twitter:card" content="summary"/>
      <meta name="twitter:site" content=""/>
      <meta name="twitter:title" content={env.title}/>
      <meta name="twitter:description" content={env.description}/>
      <meta name="twitter:image" content=""/>
    </head>
    <body>
      <div id="root" className="root">
        <div id="main" className="main">

        </div>
      </div>
    </body>
  </html>
);

export default index;
