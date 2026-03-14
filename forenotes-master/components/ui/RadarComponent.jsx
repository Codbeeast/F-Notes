import React from 'react';

const RadarComponent = () => {
  return (
    <div>
      <div className="framer-1stzqw2-container">
        <div
          className="framer-gzvjR framer-143nf7r framer-v-143nf7r"
          data-framer-name="Radar component"
          style={{ height: '100%', maxWidth: '100%', width: '100%', opacity: 1 }}
        >
          <div
            className="framer-1ehqw8y"
            data-framer-name="Outter highlight"
            style={{
              background:
                'linear-gradient(rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
              borderRadius: '500px',
              opacity: 1,
            }}
          />
          <div
            className="framer-1bce4jm"
            data-framer-name="Border light spool"
            style={{
              background: `conic-gradient(
                  from 0deg at 50% 50%,
                  rgb(41, 52, 255) 0.0444205946543972deg,
                  rgba(0, 0, 0, 0) 16.40018491628002deg,
                  rgba(0, 0, 0, 0) 322.72448493516487deg,
                  rgb(41, 52, 255) 345.28239680161835deg
                )`,
              willChange: 'transform',
              borderRadius: '500px',
              opacity: 0.5625,
              transform: 'translateX(-50%) rotate(65.3625deg)',
            }}
          />
          <div
            className="framer-xv7igh"
            data-framer-name="Main border frame"
            style={{
              backdropFilter: 'blur(11px)',
              background: 'linear-gradient(rgba(5, 5, 5, 0.76) 0%, rgba(13, 13, 13, 0.79) 100%)',
              filter: 'saturate(1.17)',
              borderRadius: '500px',
              boxShadow: `
                  rgba(0, 0, 0, 0.173) 0px 0.764039px 0.687635px -0.5px,
                  rgba(0, 0, 0, 0.17) 0px 1.87166px 1.68449px -1px,
                  rgba(0, 0, 0, 0.165) 0px 3.54652px 3.19187px -1.5px,
                  rgba(0, 0, 0, 0.16) 0px 6.19129px 5.57216px -2px,
                  rgba(0, 0, 0, 0.15) 0px 10.7756px 9.69802px -2.5px,
                  rgba(0, 0, 0, 0.125) 0px 19.7367px 17.7631px -3px,
                  rgba(0, 0, 0, 0.075) 0px 39px 35.1px -3.5px
                `,
              transform: 'translate(-50%, -50%)',
              opacity: 1,
            }}
          />
          <div
            className="framer-xknqa4"
            data-framer-name="Border inner highlight"
            style={{
              backdropFilter: 'blur(11px)',
              background: 'linear-gradient(rgb(0, 0, 0) 0%, rgba(255, 255, 255, 0.13) 100%)',
              borderRadius: '500px',
              transform: 'translate(-50%, -50%)',
              opacity: 1,
            }}
          />
          <div
            className="framer-1p1pzny"
            data-framer-name="Inner background (color)"
            style={{
              backgroundColor: 'rgb(0, 1, 5)',
              borderRadius: '500px',
              transform: 'translate(-50%, -50%)',
              opacity: 1,
            }}
          />
          <div className="framer-166olkj" data-framer-name="Inner outlines" style={{ opacity: 1 }}>
            <div
              className="framer-1socfl3"
              data-framer-name="-"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', opacity: 1 }}
            />
            <div
              className="framer-y8aghn"
              data-border="true"
              data-framer-name="O"
              style={{
                borderRadius: '500px',
                opacity: 0.01,
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="framer-1w9dmf0"
              data-border="true"
              data-framer-name="O"
              style={{
                borderRadius: '500px',
                opacity: 0.01,
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="framer-88dz9y"
              data-border="true"
              data-framer-name="O"
              style={{
                borderRadius: '500px',
                opacity: 0.01,
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="framer-trql9i"
              data-border="true"
              data-framer-name="O"
              style={{
                borderRadius: '500px',
                opacity: 0.01,
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="framer-138py8g"
              data-framer-name="vertical line"
              style={{
                backgroundColor: 'rgb(255, 255, 255)',
                opacity: 0.01,
              }}
            />
            <div
              className="framer-1yx3zku"
              data-framer-name="horizantal line"
              style={{
                backgroundColor: 'rgb(255, 255, 255)',
                opacity: 0.01,
              }}
            />
          </div>
          <div
            className="framer-19bj41o"
            data-framer-name="Light beam"
            style={{
              background: 'conic-gradient(rgb(59, 59, 59) 0deg, rgb(255, 255, 255) 360deg)',
              willChange: 'transform',
              borderRadius: '500px',
              opacity: 1,
              transform: 'translate(-50%, -50%) rotate(65.0812deg)',
            }}
          />
          <div
            className="framer-19hswn9"
            data-framer-name="Element on the radar"
            style={{ opacity: 0.01 }}
          >
            <div className="framer-169tpz" data-framer-name="lv8" style={{ opacity: 1 }}>
              <div
                data-framer-background-image-wrapper="true"
                style={{ position: 'absolute', borderRadius: 'inherit', inset: '0px' }}
              >
                <img
                  decoding="async"
                  width="111"
                  height="111"
                  src="https://framerusercontent.com/images/ubO6hprNRTUPSD1LOKrAqhScc.png"
                  alt=""
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    objectPosition: 'center center',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Gradient overlay to fade out lower portion of the radar */}
        <div className="radar-fade-overlay" />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .framer-1stzqw2-container {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: var(--framer-aspect-ratio-supported, 800px);
          left: 50%;
          max-width: 1000px;
          position: absolute;
          /* moved slightly further down */
          top: 120px;
          transform: translate(-50%);
          width: 1000px;
          /* lowered z-index so main content layers above */
          z-index: 0;
        }
        .radar-fade-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 50%;
          /* Top 30% fully transparent; then smooth fade to complete darkness */
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0) 30%,
            rgba(0, 0, 0, 0.12) 42%,
            rgba(0, 0, 0, 0.28) 54%,
            rgba(0, 0, 0, 0.46) 66%,
            rgba(0, 0, 0, 0.64) 75%,
            rgba(0, 0, 0, 0.82) 84%,
            rgba(0, 0, 0, 0.92) 92%,
            #000 100%
          );
          z-index: 6;
        }

        .framer-gzvjR .framer-143nf7r .framer-v-143nf7r {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          overflow: visible;
          position: relative;
          height: 100%;
          max-width: 100%;
          width: 100%;
          opacity: 1;
        }

        .framer-1ehqw8y {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: var(--framer-aspect-ratio-supported, 412px);
          left: 0;
          overflow: hidden;
          position: absolute;
          top: 0;
          width: 100%;
          will-change: var(--framer-will-change-override, transform);
          z-index: 0;
          background: linear-gradient(rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
          border-radius: 500px;
          opacity: 1;
        }

        .framer-1bce4jm {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          bottom: 0;
          flex: none;
          height: var(--framer-aspect-ratio-supported, 411px);
          left: 50%;
          overflow: hidden;
          position: absolute;
          width: 100%;
          z-index: 0;
          background: conic-gradient(
            from 0deg at 50% 50%,
            var(--token-077104a2-d76f-4b61-ba61-73e253fa3923, rgb(41, 52, 255))
              0.0444205946543972deg,
            rgba(0, 0, 0, 0) 16.40018491628002deg,
            rgba(0, 0, 0, 0) 322.72448493516487deg,
            var(--token-077104a2-d76f-4b61-ba61-73e253fa3923, rgb(41, 52, 255))
              345.28239680161835deg
          );
          will-change: transform;
          border-radius: 500px;
          opacity: 0.5625;
          transform: translateX(-50%) rotate(246.206deg);
        }

        .framer-xv7igh {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: var(--framer-aspect-ratio-supported, 408px);
          left: 50%;
          overflow: hidden;
          position: absolute;
          top: 50%;
          width: 99%;
          will-change: var(--framer-will-change-override, transform);
          z-index: 0;
          backdrop-filter: blur(11px);
          background: linear-gradient(rgba(5, 5, 5, 0.76) 0%, rgba(13, 13, 13, 0.79) 100%);
          filter: saturate(1.17);
          border-radius: 500px;
          box-shadow:
            rgba(0, 0, 0, 0.173) 0px 0.764039px 0.687635px -0.5px,
            rgba(0, 0, 0, 0.17) 0px 1.87166px 1.68449px -1px,
            rgba(0, 0, 0, 0.165) 0px 3.54652px 3.19187px -1.5px,
            rgba(0, 0, 0, 0.16) 0px 6.19129px 5.57216px -2px,
            rgba(0, 0, 0, 0.15) 0px 10.7756px 9.69802px -2.5px,
            rgba(0, 0, 0, 0.125) 0px 19.7367px 17.7631px -3px,
            rgba(0, 0, 0, 0.075) 0px 39px 35.1px -3.5px;
          transform: translate(-50%, -50%);
          opacity: 1;
        }

        .framer-xknqa4 {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: var(--framer-aspect-ratio-supported, 378px);
          left: 50%;
          overflow: hidden;
          position: absolute;
          top: 50%;
          width: 92%;
          will-change: var(--framer-will-change-override, transform);
          z-index: 0;
          backdrop-filter: blur(11px);
          background: linear-gradient(rgb(0, 0, 0) 0%, rgba(255, 255, 255, 0.13) 100%);
          border-radius: 500px;
          transform: translate(-50%, -50%);
          opacity: 1;
        }

        .framer-1p1pzny {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: var(--framer-aspect-ratio-supported, 376px);
          left: 50%;
          overflow: hidden;
          position: absolute;
          top: 50%;
          width: 91%;
          will-change: var(--framer-will-change-override, transform);
          z-index: 0;
          background-color: rgb(0, 1, 5);
          border-radius: 500px;
          transform: translate(-50%, -50%);
          opacity: 1;
        }

        .framer-166olkj {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          flex: none;
          height: 92%;
          left: calc(50.00000000000002% - 91.2621359223301% / 2);
          overflow: visible;
          position: absolute;
          top: calc(50.00000000000002% - 91.99029126213593% / 2);
          width: 91%;
          opacity: 1;
        }

        .framer-1socfl3 {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          flex: none;
          height: 0%;
          left: 0;
          overflow: hidden;
          position: absolute;
          top: calc(49.86807387862799% - 0.2638522427440633% / 2);
          width: 100%;
          z-index: 4;
          background-color: rgba(255, 255, 255, 0.01);
          opacity: 1;
        }

        .framer-y8aghn {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: 85%;
          left: 50%;
          overflow: hidden;
          position: absolute;
          top: 50%;
          width: var(--framer-aspect-ratio-supported, 322px);
          will-change: var(--framer-will-change-override, transform);
          z-index: 4;
          --border-bottom-width: 2px;
          --border-color: var(--token-d9bb8886-44df-46e0-9b57-91454ab878c3, rgb(255, 255, 255));
          --border-left-width: 2px;
          --border-right-width: 2px;
          --border-style: solid;
          --border-top-width: 2px;
          border-radius: 500px;
          opacity: 0.01;
          transform: translate(-50%, -50%);
        }

        .framer-y8aghn::after {
          content: '';
          border-width: var(--border-top-width, 0) var(--border-right-width, 0)
            var(--border-bottom-width, 0) var(--border-left-width, 0);
          border-color: var(--border-color, none);
          border-style: var(--border-style, none);
          width: 100%;
          height: 100%;
          position: absolute;
          box-sizing: border-box;
          left: 0;
          top: 0;
          border-radius: inherit;
          pointer-events: none;
        }

        .framer-1w9dmf0 {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: 66%;
          left: 50%;
          overflow: hidden;
          position: absolute;
          top: 50%;
          width: var(--framer-aspect-ratio-supported, 252px);
          will-change: var(--framer-will-change-override, transform);
          z-index: 4;
          --border-bottom-width: 2px;
          --border-color: var(--token-d9bb8886-44df-46e0-9b57-91454ab878c3, rgb(255, 255, 255));
          --border-left-width: 2px;
          --border-right-width: 2px;
          --border-style: solid;
          --border-top-width: 2px;
          border-radius: 500px;
          opacity: 0.01;
          transform: translate(-50%, -50%);
        }

        .framer-1w9dmf0::after {
          content: '';
          border-width: var(--border-top-width, 0) var(--border-right-width, 0)
            var(--border-bottom-width, 0) var(--border-left-width, 0);
          border-color: var(--border-color, none);
          border-style: var(--border-style, none);
          width: 100%;
          height: 100%;
          position: absolute;
          box-sizing: border-box;
          left: 0;
          top: 0;
          border-radius: inherit;
          pointer-events: none;
        }

        .framer-88dz9y {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: 46%;
          left: 50%;
          overflow: hidden;
          position: absolute;
          top: 50%;
          width: var(--framer-aspect-ratio-supported, 174px);
          will-change: var(--framer-will-change-override, transform);
          z-index: 4;
          --border-bottom-width: 2px;
          --border-color: var(--token-d9bb8886-44df-46e0-9b57-91454ab878c3, rgb(255, 255, 255));
          --border-left-width: 2px;
          --border-right-width: 2px;
          --border-style: solid;
          --border-top-width: 2px;
          border-radius: 500px;
          opacity: 0.01;
          transform: translate(-50%, -50%);
        }

        .framer-88dz9y::after {
          content: '';
          border-width: var(--border-top-width, 0) var(--border-right-width, 0)
            var(--border-bottom-width, 0) var(--border-left-width, 0);
          border-color: var(--border-color, none);
          border-style: var(--border-style, none);
          width: 100%;
          height: 100%;
          position: absolute;
          box-sizing: border-box;
          left: 0;
          top: 0;
          border-radius: inherit;
          pointer-events: none;
        }

        .framer-trql9i {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: 24%;
          left: 50%;
          overflow: hidden;
          position: absolute;
          top: 50%;
          width: var(--framer-aspect-ratio-supported, 92px);
          will-change: var(--framer-will-change-override, transform);
          z-index: 4;
          --border-bottom-width: 2px;
          --border-color: var(--token-d9bb8886-44df-46e0-9b57-91454ab878c3, rgb(255, 255, 255));
          --border-left-width: 2px;
          --border-right-width: 2px;
          --border-style: solid;
          --border-top-width: 2px;
          border-radius: 500px;
          opacity: 0.01;
          transform: translate(-50%, -50%);
        }
        .framer-trql9i::after {
          content: '';
          border-width: var(--border-top-width, 0) var(--border-right-width, 0)
            var(--border-bottom-width, 0) var(--border-left-width, 0);
          border-color: var(--border-color, none);
          border-style: var(--border-style, none);
          width: 100%;
          height: 100%;
          position: absolute;
          box-sizing: border-box;
          left: 0;
          top: 0;
          border-radius: inherit;
          pointer-events: none;
        }

        .framer-138py8g {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          flex: none;
          height: 378px;
          left: calc(49.73404255319151% - 2px / 2);
          overflow: hidden;
          position: absolute;
          top: 0;
          width: 2px;
          z-index: 0;
          background-color: var(--token-d9bb8886-44df-46e0-9b57-91454ab878c3, rgb(255, 255, 255));
          opacity: 0.01;
        }

        .framer-1yx3zku {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          flex: none;
          height: 1px;
          left: calc(50.00000000000002% - 378px / 2);
          overflow: hidden;
          position: absolute;
          top: calc(49.86807387862799% - 1px / 2);
          width: 378px;
          z-index: 0;
          background-color: var(--token-d9bb8886-44df-46e0-9b57-91454ab878c3, rgb(255, 255, 255));
          opacity: 0.01;
        }

        .framer-19bj41o {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          aspect-ratio: 1 / 1;
          flex: none;
          height: 91%;
          left: 50%;
          mix-blend-mode: color-dodge;
          overflow: hidden;
          position: absolute;
          top: 50%;
          z-index: 5;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            transparent 358deg,
            rgba(255, 255, 255, 0.8) 359deg,
            rgba(255, 255, 255, 0.2) 360deg
          );
          will-change: transform;
          border-radius: 500px;
          opacity: 1;
          transform: translate(-50%, -50%) rotate(0deg);
          animation: radar-sweep 6s linear infinite;
        }

        .framer-19hswn9 {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          align-content: center;
          align-items: center;
          display: flex;
          flex: none;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 10px;
          height: 26px;
          justify-content: center;
          left: calc(74.02912621359225% - 6.310679611650485% / 2);
          mix-blend-mode: hard-light;
          overflow: visible;
          padding: 0;
          position: absolute;
          top: calc(43.446601941747595% - 26px / 2);
          width: 6%;
          opacity: 0.01;
        }

        .framer-169tpz {
          font-size: 12px;
          font-family: sans-serif;
          --token-077104a2-d76f-4b61-ba61-73e253fa3923: rgb(41, 52, 255);
          --token-6da9d50d-e927-4dcf-93ed-bf3b8039528b: rgb(138, 165, 255);
          --token-c6d9a740-f8af-44c7-ac7a-31b27a79b7f2: rgb(3, 20, 87);
          --token-d9bb8886-44df-46e0-9b57-91454ab878c3: rgb(255, 255, 255);
          --token-a63000f8-e4b4-4f13-b0d1-a9e8e0a6c495: rgba(230, 236, 255, 0.7);
          --token-e8bc8706-b247-48f0-95ed-879074c7f908: rgb(18, 20, 38);
          --token-6d7bfc0f-867f-43f5-837b-f61a13bf9490: rgb(0, 0, 0);
          --token-d6cdc215-1644-4eef-b7f8-2481a16460d8: rgb(133, 77, 255);
          --token-b8b5c75d-b0c5-45ac-b424-57274d74cdb9: rgba(230, 235, 255, 0.08);
          --token-46702e98-c217-45da-b03e-3692f1016b00: rgba(255, 255, 255, 0.2);
          --token-cf996f70-2457-4f95-a0cf-7be0fab3e318: rgb(255, 215, 0);
          --framer-will-change-override: none;
          --framer-aspect-ratio-supported: auto;
          box-sizing: border-box;
          -webkit-font-smoothing: inherit;
          opacity: 1;
        }

        @keyframes radar-sweep {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      ` }} />
    </div >
  );
};
export default RadarComponent;