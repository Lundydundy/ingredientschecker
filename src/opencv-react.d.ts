declare module 'opencv-react' {
    var React = require('react');

    var OpenCvContext = React.createContext();
    var OpenCvConsumer = OpenCvContext.Consumer,
        Provider = OpenCvContext.Provider;
    var scriptId = 'opencv-react';
    var moduleConfig = {
      wasmBinaryFile: 'opencv_js.wasm',
      usingWasm: true
    };
    var OpenCvProvider = function OpenCvProvider(_ref) {
      var _ref$openCvVersion = _ref.openCvVersion,
          openCvVersion = _ref$openCvVersion === void 0 ? '3.4.16' : _ref$openCvVersion,
          _ref$openCvPath = _ref.openCvPath,
          openCvPath = _ref$openCvPath === void 0 ? '' : _ref$openCvPath,
          children = _ref.children;
    
      var _React$useState = React.useState({
        loaded: false,
        cv: undefined
      }),
          cvInstance = _React$useState[0],
          setCvInstance = _React$useState[1];
    
      React.useEffect(function () {
        if (document.getElementById(scriptId) || window.cv) {
          return;
        }
    
        moduleConfig.onRuntimeInitialized = function () {
          setCvInstance({
            loaded: true,
            cv: window.cv
          });
        };
    
        window.Module = moduleConfig;
    
        var generateOpenCvScriptTag = function generateOpenCvScriptTag() {
          var js = document.createElement('script');
          js.id = scriptId;
          js.src = openCvPath || "https://docs.opencv.org/" + openCvVersion + "/opencv.js";
          js.nonce = true;
          js.defer = true;
          js.async = true;
          return js;
        };
    
        document.body.appendChild(generateOpenCvScriptTag());
      }, [openCvPath, openCvVersion]);
      return /*#__PURE__*/React.createElement(Provider, {
        value: cvInstance
      }, children);
    };
    
    var useOpenCv = function useOpenCv() {
      return React.useContext(OpenCvContext);
    };
    
    exports.OpenCvConsumer = OpenCvConsumer;
    exports.OpenCvContext = OpenCvContext;
    exports.OpenCvProvider = OpenCvProvider;
    exports.useOpenCv = useOpenCv;
    //# sourceMappingURL=index.js.map
    
  }