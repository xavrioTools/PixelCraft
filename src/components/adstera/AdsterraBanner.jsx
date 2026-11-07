import React, { useEffect, useRef } from 'react';

export const AdsterraBanner = () => {
  const bannerRef = useRef(null);

  useEffect(() => {
    // Check karein ke ad pehle se insert na ho chuka ho
    if (bannerRef.current && bannerRef.current.childElementCount === 0) {
      
      // 1. atOptions script create karein
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.innerHTML = `
        atOptions = {
          'key' : 'd5670bf7325ecb481b5ee975454e36e5',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;
      bannerRef.current.appendChild(confScript);

      // 2. invoke.js script create karein
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://crypotential.com/d5670bf7325ecb481b5ee975454e36e5/invoke.js';
      bannerRef.current.appendChild(invokeScript);
    }
  }, []);

  return <div ref={bannerRef} className="ad-container" />;
};



export const AdsterraBanner728 = () => {
  const bannerRef = useRef(null);

  useEffect(() => {
    // Check karein ke ad pehle se insert na ho chuka ho
    if (bannerRef.current && bannerRef.current.childElementCount === 0) {
      
      // 1. atOptions script create karein
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.innerHTML = `
         atOptions = {
    'key' : 'dee2e37552d2078036ea847aee64d8bb',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
      `;
      bannerRef.current.appendChild(confScript);

      // 2. invoke.js script create karein
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://crypotential.com/dee2e37552d2078036ea847aee64d8bb/invoke.js';
      bannerRef.current.appendChild(invokeScript);
    }
  }, []);

  return <div ref={bannerRef} className="ad-container" />;
};