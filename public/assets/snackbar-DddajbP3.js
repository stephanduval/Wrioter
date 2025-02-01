import{b1 as G,b4 as K,c1 as Z,b5 as Q,bz as X,b7 as aa,bi as ta,b8 as ea,bj as na,c2 as la,bg as ia,bD as oa,ba as sa,r as k,aG as E,R as ra,dA as ca,cc as ba,cW as ua,cd as ma,w as L,E as da,dB as ka,Z as Va,be as Sa,b as a,bJ as pa,ax as fa,bl as va,q as j,ce as Ba,al as _a,d as g,o as y,c as T,f as t,t as n,ag as d,n as S,ah as p,a2 as x,F as $,g as xa,e as V}from"./main-BaC4daP5.js";import{m as ga,V as M}from"./VOverlay-BFLsqd3w.js";import{f as ya}from"./forwardRefs-C-GTDzx5.js";import{u as Ia}from"./scopeId-ZR_fbP0-.js";import{_ as Ta}from"./AppCardCode.vue_vue_type_style_index_0_lang-CUZ3RA7S.js";import{a as I,V as wa}from"./VRow-MD441sKt.js";import"./easing-CjukEv2V.js";import"./delay-QQ7368Uq.js";import"./lazy-dhMtJnkj.js";import"./VImg-DaBIesWz.js";import"./vue3-perfect-scrollbar.esm-DnoJNS1m.js";import"./VCard-B5K8V0Oe.js";import"./VAvatar-C7kH6m2U.js";import"./VCardText-yg2yyEKt.js";import"./VDivider-OHXYM3-S.js";/* empty css              */function Ca(s){const l=E(s);let r=-1;function e(){clearInterval(r)}function o(){e(),_a(()=>l.value=s)}function u(v){const c=v?getComputedStyle(v):{transitionDuration:.2},m=parseFloat(c.transitionDuration)*1e3||200;if(e(),l.value<=0)return;const _=performance.now();r=window.setInterval(()=>{const w=performance.now()-_+m;l.value=Math.max(s-w,0),l.value<=0&&e()},m)}return Ba(e),{clear:e,time:l,start:u,reset:o}}const $a=G({multiLine:Boolean,text:String,timer:[Boolean,String],timeout:{type:[Number,String],default:5e3},vertical:Boolean,...K({location:"bottom"}),...Z(),...Q(),...X(),...aa(),...ta(ga({transition:"v-snackbar-transition"}),["persistent","noClickAnimation","scrim","scrollStrategy"])},"VSnackbar"),f=ea()({name:"VSnackbar",props:$a(),emits:{"update:modelValue":s=>!0},setup(s,l){let{slots:r}=l;const e=na(s,"modelValue"),{positionClasses:o}=la(s),{scopeId:u}=Ia(),{themeClasses:v}=ia(s),{colorClasses:c,colorStyles:m,variantClasses:_}=oa(s),{roundedClasses:w}=sa(s),i=Ca(Number(s.timeout)),b=k(),F=k(),U=E(!1),R=E(0),h=k(),q=ra(ca,void 0);ba(()=>!!q,()=>{const B=ua();ma(()=>{h.value=B.mainStyles.value})}),L(e,O),L(()=>s.timeout,O),da(()=>{e.value&&O()});let P=-1;function O(){i.reset(),window.clearTimeout(P);const B=Number(s.timeout);if(!e.value||B===-1)return;const C=ka(F.value);i.start(C),P=window.setTimeout(()=>{e.value=!1},B)}function H(){i.reset(),window.clearTimeout(P)}function N(){U.value=!0,H()}function J(){U.value=!1,O()}function W(B){R.value=B.touches[0].clientY}function Y(B){Math.abs(R.value-B.changedTouches[0].clientY)>50&&(e.value=!1)}const z=Va(()=>s.location.split(" ").reduce((B,C)=>(B[`v-snackbar--${C}`]=!0,B),{}));return Sa(()=>{const B=M.filterProps(s),C=!!(r.default||r.text||s.text);return a(M,j({ref:b,class:["v-snackbar",{"v-snackbar--active":e.value,"v-snackbar--multi-line":s.multiLine&&!s.vertical,"v-snackbar--timer":!!s.timer,"v-snackbar--vertical":s.vertical},z.value,o.value,s.class],style:[h.value,s.style]},B,{modelValue:e.value,"onUpdate:modelValue":D=>e.value=D,contentProps:j({class:["v-snackbar__wrapper",v.value,c.value,w.value,_.value],style:[m.value],onPointerenter:N,onPointerleave:J},B.contentProps),persistent:!0,noClickAnimation:!0,scrim:!1,scrollStrategy:"none",_disableGlobalStack:!0,onTouchstartPassive:W,onTouchend:Y},u),{default:()=>{var D,A;return[pa(!1,"v-snackbar"),s.timer&&!U.value&&a("div",{key:"timer",class:"v-snackbar__timer"},[a(fa,{ref:F,color:typeof s.timer=="string"?s.timer:"info",max:s.timeout,"model-value":i.time.value},null)]),C&&a("div",{key:"content",class:"v-snackbar__content",role:"status","aria-live":"polite"},[((D=r.text)==null?void 0:D.call(r))??s.text,(A=r.default)==null?void 0:A.call(r)]),r.actions&&a(va,{defaults:{VBtn:{variant:"text",ripple:!1,slim:!0}}},{default:()=>[a("div",{class:"v-snackbar__actions"},[r.actions({isActive:e})])]})]},activator:r.activator})}),ya({},b)}}),Oa={class:"demo-space-x"},Da=g({__name:"DemoSnackbarTransition",setup(s){const l=k(!1),r=k(!1),e=k(!1);return(o,u)=>(y(),T("div",Oa,[a(d,{onClick:u[0]||(u[0]=v=>l.value=!0)},{default:t(()=>[n(" fade snackbar ")]),_:1}),a(f,{modelValue:S(l),"onUpdate:modelValue":u[1]||(u[1]=v=>p(l)?l.value=v:null),transition:"fade-transition",location:"top start"},{default:t(()=>[n(" I'm a fade transition snackbar. ")]),_:1},8,["modelValue"]),a(d,{onClick:u[2]||(u[2]=v=>r.value=!0)},{default:t(()=>[n(" Scale snackbar ")]),_:1}),a(f,{modelValue:S(r),"onUpdate:modelValue":u[3]||(u[3]=v=>p(r)?r.value=v:null),transition:"scale-transition",location:"bottom end"},{default:t(()=>[n(" I'm a scale transition snackbar. ")]),_:1},8,["modelValue"]),a(d,{onClick:u[4]||(u[4]=v=>e.value=!0)},{default:t(()=>[n(" scroll y reverse ")]),_:1}),a(f,{modelValue:S(e),"onUpdate:modelValue":u[5]||(u[5]=v=>p(e)?e.value=v:null),transition:"scroll-y-reverse-transition",location:"top end"},{default:t(()=>[n(" I'm a scroll y reverse transition snackbar. ")]),_:1},8,["modelValue"])]))}}),Ua={class:"demo-space-x"},Pa=g({__name:"DemoSnackbarVariants",setup(s){const l=k(!1),r=k(!1),e=k(!1),o=k(!1),u=k(!1);return(v,c)=>(y(),T("div",Ua,[a(d,{onClick:c[0]||(c[0]=m=>l.value=!0)},{default:t(()=>[n(" Default ")]),_:1}),a(f,{modelValue:S(l),"onUpdate:modelValue":c[1]||(c[1]=m=>p(l)?l.value=m:null),location:"top start"},{default:t(()=>[n(" Jelly chocolate bar candy canes apple pie. ")]),_:1},8,["modelValue"]),a(d,{onClick:c[2]||(c[2]=m=>r.value=!0)},{default:t(()=>[n(" tonal ")]),_:1}),a(f,{modelValue:S(r),"onUpdate:modelValue":c[3]||(c[3]=m=>p(r)?r.value=m:null),location:"top end",variant:"tonal"},{default:t(()=>[n(" Ice cream cake candy canes. ")]),_:1},8,["modelValue"]),a(d,{onClick:c[4]||(c[4]=m=>e.value=!0)},{default:t(()=>[n(" Text ")]),_:1}),a(f,{modelValue:S(e),"onUpdate:modelValue":c[5]||(c[5]=m=>p(e)?e.value=m:null),location:"end center",variant:"text"},{default:t(()=>[n(" Pie icing biscuit soufflé liquorice topping. ")]),_:1},8,["modelValue"]),a(d,{onClick:c[6]||(c[6]=m=>o.value=!0)},{default:t(()=>[n(" Outlined ")]),_:1}),a(f,{modelValue:S(o),"onUpdate:modelValue":c[7]||(c[7]=m=>p(o)?o.value=m:null),location:"bottom end",variant:"outlined",color:"error"},{default:t(()=>[n(" Oat cake caramels sesame snaps candy. ")]),_:1},8,["modelValue"]),a(d,{onClick:c[8]||(c[8]=m=>u.value=!0)},{default:t(()=>[n(" Flat ")]),_:1}),a(f,{modelValue:S(u),"onUpdate:modelValue":c[9]||(c[9]=m=>p(u)?u.value=m:null),location:"bottom start",variant:"flat",color:"error"},{default:t(()=>[n(" Oat cake caramels sesame snaps candy. ")]),_:1},8,["modelValue"])]))}}),Ea={class:"demo-space-x"},Fa=g({__name:"DemoSnackbarPosition",setup(s){const l=k(!1),r=k(!1),e=k(!1),o=k(!1),u=k(!1),v=k(!1),c=k(!1),m=k(!1),_=k(!1);return(w,i)=>(y(),T("div",Ea,[a(d,{icon:"",variant:"text",onClick:i[0]||(i[0]=b=>r.value=!0)},{default:t(()=>[a(x,{icon:"bx-up-arrow-alt"})]),_:1}),a(f,{modelValue:S(r),"onUpdate:modelValue":i[1]||(i[1]=b=>p(r)?r.value=b:null),location:"top"},{default:t(()=>[n(" I'm a top snackbar. ")]),_:1},8,["modelValue"]),a(d,{icon:"",variant:"text",onClick:i[2]||(i[2]=b=>e.value=!0)},{default:t(()=>[a(x,{icon:"mdi-arrow-top-right"})]),_:1}),a(f,{modelValue:S(e),"onUpdate:modelValue":i[3]||(i[3]=b=>p(e)?e.value=b:null),location:"top end"},{default:t(()=>[n(" I'm a top right snackbar. ")]),_:1},8,["modelValue"]),a(d,{icon:"",variant:"text",onClick:i[4]||(i[4]=b=>c.value=!0)},{default:t(()=>[a(x,{icon:"bx-right-arrow-alt"})]),_:1}),a(f,{modelValue:S(c),"onUpdate:modelValue":i[5]||(i[5]=b=>p(c)?c.value=b:null),location:"end center"},{default:t(()=>[n(" I'm a center end snackbar. ")]),_:1},8,["modelValue"]),a(d,{icon:"",variant:"text",onClick:i[6]||(i[6]=b=>o.value=!0)},{default:t(()=>[a(x,{icon:"mdi-arrow-bottom-right"})]),_:1}),a(f,{modelValue:S(o),"onUpdate:modelValue":i[7]||(i[7]=b=>p(o)?o.value=b:null),location:"bottom end"},{default:t(()=>[n(" I'm a bottom end snackbar. ")]),_:1},8,["modelValue"]),a(d,{icon:"",variant:"text",onClick:i[8]||(i[8]=b=>u.value=!0)},{default:t(()=>[a(x,{icon:"bx-down-arrow-alt"})]),_:1}),a(f,{modelValue:S(u),"onUpdate:modelValue":i[9]||(i[9]=b=>p(u)?u.value=b:null)},{default:t(()=>[n(" I'm a bottom snackbar. ")]),_:1},8,["modelValue"]),a(d,{icon:"",variant:"text",onClick:i[10]||(i[10]=b=>v.value=!0)},{default:t(()=>[a(x,{icon:"mdi-arrow-bottom-left"})]),_:1}),a(f,{modelValue:S(v),"onUpdate:modelValue":i[11]||(i[11]=b=>p(v)?v.value=b:null),location:"bottom start"},{default:t(()=>[n(" I'm a bottom start snackbar. ")]),_:1},8,["modelValue"]),a(d,{icon:"",variant:"text",onClick:i[12]||(i[12]=b=>m.value=!0)},{default:t(()=>[a(x,{icon:"bx-left-arrow-alt"})]),_:1}),a(f,{modelValue:S(m),"onUpdate:modelValue":i[13]||(i[13]=b=>p(m)?m.value=b:null),location:"start center"},{default:t(()=>[n(" I'm a center start snackbar. ")]),_:1},8,["modelValue"]),a(d,{icon:"",variant:"text",onClick:i[14]||(i[14]=b=>l.value=!0)},{default:t(()=>[a(x,{icon:"mdi-arrow-top-left"})]),_:1}),a(f,{modelValue:S(l),"onUpdate:modelValue":i[15]||(i[15]=b=>p(l)?l.value=b:null),location:"top start"},{default:t(()=>[n(" I'm a top start snackbar. ")]),_:1},8,["modelValue"]),a(d,{icon:"",variant:"text",onClick:i[16]||(i[16]=b=>_.value=!0)},{default:t(()=>[a(x,{icon:"mdi-arrow-collapse-all"})]),_:1}),a(f,{modelValue:S(_),"onUpdate:modelValue":i[17]||(i[17]=b=>p(_)?_.value=b:null),location:"center"},{default:t(()=>[n(" I'm a center snackbar. ")]),_:1},8,["modelValue"])]))}}),Ra=g({__name:"DemoSnackbarVertical",setup(s){const l=k(!1);return(r,e)=>(y(),T($,null,[a(d,{onClick:e[0]||(e[0]=o=>l.value=!0)},{default:t(()=>[n(" Open Snackbar ")]),_:1}),a(f,{modelValue:S(l),"onUpdate:modelValue":e[3]||(e[3]=o=>p(l)?l.value=o:null),vertical:""},{actions:t(()=>[a(d,{color:"success",onClick:e[1]||(e[1]=o=>l.value=!1)},{default:t(()=>[n(" Undo ")]),_:1}),a(d,{color:"error",onClick:e[2]||(e[2]=o=>l.value=!1)},{default:t(()=>[n(" Close ")]),_:1})]),default:t(()=>[n(" Sugar plum chocolate bar halvah sesame snaps apple pie donut croissant marshmallow. Sweet roll donut gummies sesame snaps icing bear claw tiramisu cotton candy. ")]),_:1},8,["modelValue"])],64))}}),ha=g({__name:"DemoSnackbarTimeout",setup(s){const l=k(!1);return(r,e)=>(y(),T($,null,[a(d,{onClick:e[0]||(e[0]=o=>l.value=!0)},{default:t(()=>[n(" Open Snackbar ")]),_:1}),a(f,{modelValue:S(l),"onUpdate:modelValue":e[1]||(e[1]=o=>p(l)?l.value=o:null),timeout:2e3},{default:t(()=>[n(" My timeout is set to 2000. ")]),_:1},8,["modelValue"])],64))}}),Aa=g({__name:"DemoSnackbarMultiLine",setup(s){const l=k(!1);return(r,e)=>(y(),T($,null,[a(d,{onClick:e[0]||(e[0]=o=>l.value=!0)},{default:t(()=>[n(" Open Snackbar ")]),_:1}),a(f,{modelValue:S(l),"onUpdate:modelValue":e[2]||(e[2]=o=>p(l)?l.value=o:null),"multi-line":""},{actions:t(()=>[a(d,{color:"error",onClick:e[1]||(e[1]=o=>l.value=!1)},{default:t(()=>[n(" Close ")]),_:1})]),default:t(()=>[n(" I am a multi-line snackbar. I can have more than one line. This is another line that is quite long. ")]),_:1},8,["modelValue"])],64))}}),La=g({__name:"DemoSnackbarWithAction",setup(s){const l=k(!1);return(r,e)=>(y(),T($,null,[a(d,{onClick:e[0]||(e[0]=o=>l.value=!0)},{default:t(()=>[n(" Open Snackbar ")]),_:1}),a(f,{modelValue:S(l),"onUpdate:modelValue":e[2]||(e[2]=o=>p(l)?l.value=o:null)},{actions:t(()=>[a(d,{color:"error",onClick:e[1]||(e[1]=o=>l.value=!1)},{default:t(()=>[n(" Close ")]),_:1})]),default:t(()=>[n(" Hello, I'm a snackbar with actions. ")]),_:1},8,["modelValue"])],64))}}),ja=g({__name:"DemoSnackbarBasic",setup(s){const l=k(!1);return(r,e)=>(y(),T($,null,[a(d,{onClick:e[0]||(e[0]=o=>l.value=!0)},{default:t(()=>[n(" Open Snackbar ")]),_:1}),a(f,{modelValue:S(l),"onUpdate:modelValue":e[1]||(e[1]=o=>p(l)?l.value=o:null)},{default:t(()=>[n(" Hello, I'm a snackbar ")]),_:1},8,["modelValue"])],64))}}),Ma={ts:`<script lang="ts" setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- SnackBar -->
  <VSnackbar v-model="isSnackbarVisible">
    Hello, I'm a snackbar
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- SnackBar -->
  <VSnackbar v-model="isSnackbarVisible">
    Hello, I'm a snackbar
  </VSnackbar>
</template>
`},qa={ts:`<script lang="ts" setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    multi-line
  >
    I am a multi-line snackbar. I can have more than one line. This is another line that is quite long.

    <template #actions>
      <VBtn
        color="error"
        @click="isSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    multi-line
  >
    I am a multi-line snackbar. I can have more than one line. This is another line that is quite long.

    <template #actions>
      <VBtn
        color="error"
        @click="isSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`},Ha={ts:`<script lang="ts" setup>
const isSnackbarTopStartVisible = ref(false)
const isSnackbarTopVisible = ref(false)
const isSnackbarTopEndVisible = ref(false)
const isSnackbarBottomEndVisible = ref(false)
const isSnackbarBottomVisible = ref(false)
const isSnackbarBottomStartVisible = ref(false)
const isSnackbarEndVisible = ref(false)
const isSnackbarStartVisible = ref(false)
const isSnackbarCenteredVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- top  -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopVisible = true"
    >
      <VIcon icon="bx-up-arrow-alt" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopVisible"
      location="top"
    >
      I'm a top snackbar.
    </VSnackbar>

    <!-- top end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopEndVisible = true"
    >
      <VIcon icon="mdi-arrow-top-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopEndVisible"
      location="top end"
    >
      I'm a top right snackbar.
    </VSnackbar>

    <!-- center end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarEndVisible = true"
    >
      <VIcon icon="bx-right-arrow-alt" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarEndVisible"
      location="end center"
    >
      I'm a center end snackbar.
    </VSnackbar>

    <!-- bottom end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomEndVisible = true"
    >
      <VIcon icon="mdi-arrow-bottom-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarBottomEndVisible"
      location="bottom end"
    >
      I'm a bottom end snackbar.
    </VSnackbar>

    <!-- bottom -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomVisible = true"
    >
      <VIcon icon="bx-down-arrow-alt" />
    </VBtn>

    <VSnackbar v-model="isSnackbarBottomVisible">
      I'm a bottom snackbar.
    </VSnackbar>

    <!-- bottom start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomStartVisible = true"
    >
      <VIcon icon="mdi-arrow-bottom-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarBottomStartVisible"
      location="bottom start"
    >
      I'm a bottom start snackbar.
    </VSnackbar>

    <!-- center start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarStartVisible = true"
    >
      <VIcon icon="bx-left-arrow-alt" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarStartVisible"
      location="start center"
    >
      I'm a center start snackbar.
    </VSnackbar>

    <!-- top start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopStartVisible = true"
    >
      <VIcon icon="mdi-arrow-top-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopStartVisible"
      location="top start"
    >
      I'm a top start snackbar.
    </VSnackbar>

    <!-- center -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarCenteredVisible = true"
    >
      <VIcon icon="mdi-arrow-collapse-all" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarCenteredVisible"
      location="center"
    >
      I'm a center snackbar.
    </VSnackbar>
  </div>
</template>
`,js:`<script setup>
const isSnackbarTopStartVisible = ref(false)
const isSnackbarTopVisible = ref(false)
const isSnackbarTopEndVisible = ref(false)
const isSnackbarBottomEndVisible = ref(false)
const isSnackbarBottomVisible = ref(false)
const isSnackbarBottomStartVisible = ref(false)
const isSnackbarEndVisible = ref(false)
const isSnackbarStartVisible = ref(false)
const isSnackbarCenteredVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- top  -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopVisible = true"
    >
      <VIcon icon="bx-up-arrow-alt" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopVisible"
      location="top"
    >
      I'm a top snackbar.
    </VSnackbar>

    <!-- top end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopEndVisible = true"
    >
      <VIcon icon="mdi-arrow-top-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopEndVisible"
      location="top end"
    >
      I'm a top right snackbar.
    </VSnackbar>

    <!-- center end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarEndVisible = true"
    >
      <VIcon icon="bx-right-arrow-alt" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarEndVisible"
      location="end center"
    >
      I'm a center end snackbar.
    </VSnackbar>

    <!-- bottom end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomEndVisible = true"
    >
      <VIcon icon="mdi-arrow-bottom-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarBottomEndVisible"
      location="bottom end"
    >
      I'm a bottom end snackbar.
    </VSnackbar>

    <!-- bottom -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomVisible = true"
    >
      <VIcon icon="bx-down-arrow-alt" />
    </VBtn>

    <VSnackbar v-model="isSnackbarBottomVisible">
      I'm a bottom snackbar.
    </VSnackbar>

    <!-- bottom start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomStartVisible = true"
    >
      <VIcon icon="mdi-arrow-bottom-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarBottomStartVisible"
      location="bottom start"
    >
      I'm a bottom start snackbar.
    </VSnackbar>

    <!-- center start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarStartVisible = true"
    >
      <VIcon icon="bx-left-arrow-alt" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarStartVisible"
      location="start center"
    >
      I'm a center start snackbar.
    </VSnackbar>

    <!-- top start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopStartVisible = true"
    >
      <VIcon icon="mdi-arrow-top-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopStartVisible"
      location="top start"
    >
      I'm a top start snackbar.
    </VSnackbar>

    <!-- center -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarCenteredVisible = true"
    >
      <VIcon icon="mdi-arrow-collapse-all" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarCenteredVisible"
      location="center"
    >
      I'm a center snackbar.
    </VSnackbar>
  </div>
</template>
`},Na={ts:`<script lang="ts" setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    :timeout="2000"
  >
    My timeout is set to 2000.
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    :timeout="2000"
  >
    My timeout is set to 2000.
  </VSnackbar>
</template>
`},Ja={ts:`<script lang="ts" setup>
const isSnackbarFadeVisible = ref(false)
const isSnackbarScaleVisible = ref(false)
const isSnackbarScrollReverseVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- fade -->
    <VBtn @click="isSnackbarFadeVisible = true">
      fade snackbar
    </VBtn>

    <VSnackbar
      v-model="isSnackbarFadeVisible"
      transition="fade-transition"
      location="top start"
    >
      I'm a fade transition snackbar.
    </VSnackbar>

    <!-- scale -->
    <VBtn @click="isSnackbarScaleVisible = true">
      Scale snackbar
    </VBtn>

    <VSnackbar
      v-model="isSnackbarScaleVisible"
      transition="scale-transition"
      location="bottom end"
    >
      I'm a scale transition snackbar.
    </VSnackbar>

    <!-- scroll y reverse -->
    <VBtn @click="isSnackbarScrollReverseVisible = true">
      scroll y reverse
    </VBtn>

    <VSnackbar
      v-model="isSnackbarScrollReverseVisible"
      transition="scroll-y-reverse-transition"
      location="top end"
    >
      I'm a scroll y reverse transition snackbar.
    </VSnackbar>
  </div>
</template>
`,js:`<script setup>
const isSnackbarFadeVisible = ref(false)
const isSnackbarScaleVisible = ref(false)
const isSnackbarScrollReverseVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- fade -->
    <VBtn @click="isSnackbarFadeVisible = true">
      fade snackbar
    </VBtn>

    <VSnackbar
      v-model="isSnackbarFadeVisible"
      transition="fade-transition"
      location="top start"
    >
      I'm a fade transition snackbar.
    </VSnackbar>

    <!-- scale -->
    <VBtn @click="isSnackbarScaleVisible = true">
      Scale snackbar
    </VBtn>

    <VSnackbar
      v-model="isSnackbarScaleVisible"
      transition="scale-transition"
      location="bottom end"
    >
      I'm a scale transition snackbar.
    </VSnackbar>

    <!-- scroll y reverse -->
    <VBtn @click="isSnackbarScrollReverseVisible = true">
      scroll y reverse
    </VBtn>

    <VSnackbar
      v-model="isSnackbarScrollReverseVisible"
      transition="scroll-y-reverse-transition"
      location="top end"
    >
      I'm a scroll y reverse transition snackbar.
    </VSnackbar>
  </div>
</template>
`},Wa={ts:`<script lang="ts" setup>
const isDefaultSnackbarVisible = ref(false)
const isTonalSnackbarVisible = ref(false)
const isTextSnackbarVisible = ref(false)
const isOutlinedSnackbarVisible = ref(false)
const isFlatSnackbarVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- Default toggle btn -->
    <VBtn @click="isDefaultSnackbarVisible = true">
      Default
    </VBtn>

    <!-- Default snackbar -->
    <VSnackbar
      v-model="isDefaultSnackbarVisible"
      location="top start"
    >
      Jelly chocolate bar candy canes apple pie.
    </VSnackbar>

    <!-- tonal toggle btn -->
    <VBtn @click="isTonalSnackbarVisible = true">
      tonal
    </VBtn>

    <!-- tonal snackbar -->
    <VSnackbar
      v-model="isTonalSnackbarVisible"
      location="top end"
      variant="tonal"
    >
      Ice cream cake candy canes.
    </VSnackbar>

    <!-- Text toggle btn -->
    <VBtn @click="isTextSnackbarVisible = true">
      Text
    </VBtn>

    <!-- Text snackbar -->
    <VSnackbar
      v-model="isTextSnackbarVisible"
      location="end center"
      variant="text"
    >
      Pie icing biscuit soufflé liquorice topping.
    </VSnackbar>

    <!-- Outline toggle btn -->
    <VBtn @click="isOutlinedSnackbarVisible = true">
      Outlined
    </VBtn>

    <!-- Outline snackbar -->
    <VSnackbar
      v-model="isOutlinedSnackbarVisible"
      location="bottom end"
      variant="outlined"
      color="error"
    >
      Oat cake caramels sesame snaps candy.
    </VSnackbar>

    <!-- flat toggle btn -->
    <VBtn @click="isFlatSnackbarVisible = true">
      Flat
    </VBtn>

    <!-- flat snackbar -->
    <VSnackbar
      v-model="isFlatSnackbarVisible"
      location="bottom start"
      variant="flat"
      color="error"
    >
      Oat cake caramels sesame snaps candy.
    </VSnackbar>
  </div>
</template>
`,js:`<script setup>
const isDefaultSnackbarVisible = ref(false)
const isTonalSnackbarVisible = ref(false)
const isTextSnackbarVisible = ref(false)
const isOutlinedSnackbarVisible = ref(false)
const isFlatSnackbarVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- Default toggle btn -->
    <VBtn @click="isDefaultSnackbarVisible = true">
      Default
    </VBtn>

    <!-- Default snackbar -->
    <VSnackbar
      v-model="isDefaultSnackbarVisible"
      location="top start"
    >
      Jelly chocolate bar candy canes apple pie.
    </VSnackbar>

    <!-- tonal toggle btn -->
    <VBtn @click="isTonalSnackbarVisible = true">
      tonal
    </VBtn>

    <!-- tonal snackbar -->
    <VSnackbar
      v-model="isTonalSnackbarVisible"
      location="top end"
      variant="tonal"
    >
      Ice cream cake candy canes.
    </VSnackbar>

    <!-- Text toggle btn -->
    <VBtn @click="isTextSnackbarVisible = true">
      Text
    </VBtn>

    <!-- Text snackbar -->
    <VSnackbar
      v-model="isTextSnackbarVisible"
      location="end center"
      variant="text"
    >
      Pie icing biscuit soufflé liquorice topping.
    </VSnackbar>

    <!-- Outline toggle btn -->
    <VBtn @click="isOutlinedSnackbarVisible = true">
      Outlined
    </VBtn>

    <!-- Outline snackbar -->
    <VSnackbar
      v-model="isOutlinedSnackbarVisible"
      location="bottom end"
      variant="outlined"
      color="error"
    >
      Oat cake caramels sesame snaps candy.
    </VSnackbar>

    <!-- flat toggle btn -->
    <VBtn @click="isFlatSnackbarVisible = true">
      Flat
    </VBtn>

    <!-- flat snackbar -->
    <VSnackbar
      v-model="isFlatSnackbarVisible"
      location="bottom start"
      variant="flat"
      color="error"
    >
      Oat cake caramels sesame snaps candy.
    </VSnackbar>
  </div>
</template>
`},Ya={ts:`<script lang="ts" setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <VSnackbar
    v-model="isSnackbarVisible"
    vertical
  >
    Sugar plum chocolate bar halvah sesame snaps apple pie donut croissant marshmallow. Sweet roll donut gummies sesame snaps icing bear claw tiramisu cotton candy.

    <template #actions>
      <VBtn
        color="success"
        @click="isSnackbarVisible = false"
      >
        Undo
      </VBtn>

      <VBtn
        color="error"
        @click="isSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <VSnackbar
    v-model="isSnackbarVisible"
    vertical
  >
    Sugar plum chocolate bar halvah sesame snaps apple pie donut croissant marshmallow. Sweet roll donut gummies sesame snaps icing bear claw tiramisu cotton candy.

    <template #actions>
      <VBtn
        color="success"
        @click="isSnackbarVisible = false"
      >
        Undo
      </VBtn>

      <VBtn
        color="error"
        @click="isSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`},za={ts:`<script lang="ts" setup>
const isSnackbarVisibility = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisibility = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar v-model="isSnackbarVisibility">
    Hello, I'm a snackbar with actions.

    <template #actions>
      <VBtn
        color="error"
        @click="isSnackbarVisibility = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisibility = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisibility = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar v-model="isSnackbarVisibility">
    Hello, I'm a snackbar with actions.

    <template #actions>
      <VBtn
        color="error"
        @click="isSnackbarVisibility = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`},Ga=V("p",null,[n("The "),V("code",null,"v-snackbar"),n(" component is used to display a quick message to a user. Snackbars support positioning, removal delay, and callbacks.")],-1),Ka=V("p",null,[n("Use "),V("code",null,"actions"),n(" slot to add action button. A "),V("code",null,"v-snackbar"),n(" in its simplest form displays a temporary and closable notification to the user.")],-1),Za=V("p",null,[n("The "),V("code",null,"multi-line"),n(" property extends the height of the "),V("code",null,"v-snackbar"),n(" to give you a little more room for content.")],-1),Qa=V("p",null,[n("The "),V("code",null,"timeout"),n(" property lets you customize the delay before the "),V("code",null,"v-snackbar"),n(" is hidden.")],-1),Xa=V("p",null,[n("The "),V("code",null,"vertical"),n(" property allows you to stack the content of your "),V("code",null,"v-snackbar"),n(".")],-1),at=V("p",null,[n("Use "),V("code",null,"location"),n(" prop to change the position of snackbar.")],-1),tt=V("p",null,[n("Apply different styles to the snackbar using props such as "),V("code",null,"shaped"),n(", "),V("code",null,"rounded"),n(", "),V("code",null,"color"),n(", "),V("code",null,"text"),n(", "),V("code",null,"outlined"),n(", "),V("code",null,"tile"),n(" and more.")],-1),et=V("p",null,"Use transition prop to sets the component transition.",-1),vt=g({__name:"snackbar",setup(s){return(l,r)=>{const e=ja,o=Ta,u=La,v=Aa,c=ha,m=Ra,_=Fa,w=Pa,i=Da;return y(),xa(wa,{class:"match-height"},{default:t(()=>[a(I,{cols:"12",md:"6"},{default:t(()=>[a(o,{title:"Basic",code:Ma},{default:t(()=>[Ga,a(e)]),_:1},8,["code"])]),_:1}),a(I,{cols:"12",md:"6"},{default:t(()=>[a(o,{title:"With Action",code:za},{default:t(()=>[Ka,a(u)]),_:1},8,["code"])]),_:1}),a(I,{cols:"12",md:"6"},{default:t(()=>[a(o,{title:"Multi Line",code:qa},{default:t(()=>[Za,a(v)]),_:1},8,["code"])]),_:1}),a(I,{cols:"12",md:"6"},{default:t(()=>[a(o,{title:"Timeout",code:Na},{default:t(()=>[Qa,a(c)]),_:1},8,["code"])]),_:1}),a(I,{cols:"12",md:"6"},{default:t(()=>[a(o,{title:"Vertical",code:Ya},{default:t(()=>[Xa,a(m)]),_:1},8,["code"])]),_:1}),a(I,{cols:"12",md:"6"},{default:t(()=>[a(o,{title:"Position",code:Ha},{default:t(()=>[at,a(_)]),_:1},8,["code"])]),_:1}),a(I,{cols:"12",md:"6"},{default:t(()=>[a(o,{title:"Variants",code:Wa},{default:t(()=>[tt,a(w)]),_:1},8,["code"])]),_:1}),a(I,{cols:"12",md:"6"},{default:t(()=>[a(o,{title:"Transition",code:Ja},{default:t(()=>[et,a(i)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{vt as default};
