
import Head from 'next/head';
import ThemeProvider from '../src/theme/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../src/createEmotionCache';
import "../src/css/globals.css";

import {RecoilRoot} from 'recoil';
const clientSideEmotionCache = createEmotionCache();

function App(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
    return (
    <RecoilRoot>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>Tokyo Free White NextJS Typescript Admin Dashboard</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
        </Head>
          <ThemeProvider>
              <CssBaseline />
              {getLayout(<Component {...pageProps} />)}
          </ThemeProvider>
      </CacheProvider>
    </RecoilRoot>
    )
  }
  
  export default App
  