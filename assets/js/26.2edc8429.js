(window.webpackJsonp=window.webpackJsonp||[]).push([[26,43],{252:function(t,n,e){"use strict";e.d(n,"d",(function(){return r})),e.d(n,"a",(function(){return s})),e.d(n,"i",(function(){return o})),e.d(n,"f",(function(){return a})),e.d(n,"g",(function(){return l})),e.d(n,"h",(function(){return c})),e.d(n,"b",(function(){return f})),e.d(n,"e",(function(){return h})),e.d(n,"k",(function(){return p})),e.d(n,"l",(function(){return d})),e.d(n,"c",(function(){return m})),e.d(n,"j",(function(){return b}));e(46);const r=/#.*$/,i=/\.(md|html)$/,s=/\/$/,o=/^[a-z]+:/i;function u(t){return decodeURI(t).replace(r,"").replace(i,"")}function a(t){return o.test(t)}function l(t){return/^mailto:/.test(t)}function c(t){return/^tel:/.test(t)}function f(t){if(a(t))return t;const n=t.match(r),e=n?n[0]:"",i=u(t);return s.test(i)?t:i+".html"+e}function h(t,n){const e=decodeURIComponent(t.hash),i=function(t){const n=t.match(r);if(n)return n[0]}(n);if(i&&e!==i)return!1;return u(t.path)===u(n)}function p(t,n,e){if(a(n))return{type:"external",path:n};e&&(n=function(t,n,e){const r=t.charAt(0);if("/"===r)return t;if("?"===r||"#"===r)return n+t;const i=n.split("/");e&&i[i.length-1]||i.pop();const s=t.replace(/^\//,"").split("/");for(let t=0;t<s.length;t++){const n=s[t];".."===n?i.pop():"."!==n&&i.push(n)}""!==i[0]&&i.unshift("");return i.join("/")}(n,e));const r=u(n);for(let n=0;n<t.length;n++)if(u(t[n].regularPath)===r)return Object.assign({},t[n],{type:"page",path:f(t[n].path)});return console.error(`[vuepress] No matching page found for sidebar item "${n}"`),{}}function d(t,n,e,r){const{pages:i,themeConfig:s}=e,o=r&&s.locales&&s.locales[r]||s;if("auto"===(t.frontmatter.sidebar||o.sidebar||s.sidebar))return g(t);const u=o.sidebar||s.sidebar;if(u){const{base:e,config:r}=function(t,n){if(Array.isArray(n))return{base:"/",config:n};for(const r in n)if(0===(e=t,/(\.html|\/)$/.test(e)?e:e+"/").indexOf(encodeURI(r)))return{base:r,config:n[r]};var e;return{}}(n,u);return"auto"===r?g(t):r?r.map(t=>function t(n,e,r,i=1){if("string"==typeof n)return p(e,n,r);if(Array.isArray(n))return Object.assign(p(e,n[0],r),{title:n[1]});{const s=n.children||[];return 0===s.length&&n.path?Object.assign(p(e,n.path,r),{title:n.title}):{type:"group",path:n.path,title:n.title,sidebarDepth:n.sidebarDepth,initialOpenGroupIndex:n.initialOpenGroupIndex,children:s.map(n=>t(n,e,r,i+1)),collapsable:!1!==n.collapsable}}}(t,i,e)):[]}return[]}function g(t){const n=m(t.headers||[]);return[{type:"group",collapsable:!1,title:t.title,path:null,children:n.map(n=>({type:"auto",title:n.title,basePath:t.path,path:t.path+"#"+n.slug,children:n.children||[]}))}]}function m(t){let n;return(t=t.map(t=>Object.assign({},t))).forEach(t=>{2===t.level?n=t:n&&(n.children||(n.children=[])).push(t)}),t.filter(t=>2===t.level)}function b(t){return Object.assign(t,{type:t.items&&t.items.length?"links":"link"})}},254:function(t,n,e){"use strict";e.r(n);var r=e(252),i={name:"NavLink",props:{item:{required:!0}},computed:{link(){return Object(r.b)(this.item.link)},exact(){return this.$site.locales?Object.keys(this.$site.locales).some(t=>t===this.link):"/"===this.link},isNonHttpURI(){return Object(r.g)(this.link)||Object(r.h)(this.link)},isBlankTarget(){return"_blank"===this.target},isInternal(){return!Object(r.f)(this.link)&&!this.isBlankTarget},target(){return this.isNonHttpURI?null:this.item.target?this.item.target:Object(r.f)(this.link)?"_blank":""},rel(){return this.isNonHttpURI||!1===this.item.rel?null:this.item.rel?this.item.rel:this.isBlankTarget?"noopener noreferrer":null}},methods:{focusoutAction(){this.$emit("focusout")}}},s=e(7),o=Object(s.a)(i,(function(){var t=this,n=t._self._c;return t.isInternal?n("RouterLink",{staticClass:"nav-link",attrs:{to:t.link,exact:t.exact},nativeOn:{focusout:function(n){return t.focusoutAction.apply(null,arguments)}}},[t._v("\n  "+t._s(t.item.text)+"\n")]):n("a",{staticClass:"nav-link external",attrs:{href:t.link,target:t.target,rel:t.rel},on:{focusout:t.focusoutAction}},[t._v("\n  "+t._s(t.item.text)+"\n  "),t.isBlankTarget?n("OutboundLink"):t._e()],1)}),[],!1,null,null,null);n.default=o.exports},258:function(t,n,e){},267:function(t,n,e){"use strict";e(258)},270:function(t,n,e){"use strict";e.r(n);var r={name:"Footer",components:{NavLink:e(254).default},computed:{links(){return this.$site.themeConfig.footer.links},copyright(){return this.$site.themeConfig.footer.copyright}}},i=(e(267),e(7)),s=Object(i.a)(r,(function(){var t=this,n=t._self._c;return n("footer",{staticClass:"footer"},[n("div",{staticClass:"wrap"},[n("div",{staticClass:"wrap-border"},[n("div",{staticClass:"inner"},[n("div",{staticClass:"footer-content"},t._l(t.links,(function(e){return n("div",{key:e.title,staticClass:"footer-block"},[n("h4",[t._v(t._s(e.title))]),t._v(" "),t._l(e.children,(function(t){return n("div",{key:t.link},[n("NavLink",{attrs:{item:t}})],1)}))],2)})),0),t._v(" "),t.copyright?n("p",{staticClass:"copyright"},[t._v(t._s(t.copyright))]):t._e()])])])])}),[],!1,null,null,null);n.default=s.exports}}]);