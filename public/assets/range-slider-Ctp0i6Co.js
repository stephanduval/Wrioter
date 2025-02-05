import{m as ee,u as le,a as te,V as ae,b as q,g as E}from"./VSliderTrack-Dc_EYP4A.js";import{m as se,V as Z}from"./VInput-iEBwr0fp.js";import{m as oe,u as ue,V as ne}from"./form-C6PetfES.js";import{b1 as re,b8 as ie,r as _,c3 as de,bj as ce,Z as G,be as me,b as t,F as pe,q as ve,d as g,o as S,g as R,n as $,ah as k,f as d,a2 as be,e as c,t as v}from"./main-Ca4qx7y-.js";import{_ as Ve}from"./AppCardCode.vue_vue_type_style_index_0_lang-Bq5KC9kd.js";import{a as x,V as fe}from"./VRow-EsZ_8CZn.js";import"./VImg-C3GobFkp.js";import"./vue3-perfect-scrollbar.esm-CLCcbP0n.js";import"./VCard-k3dQT3Up.js";import"./VAvatar-B3k1LwfD.js";import"./VCardText-iX3erHMv.js";import"./VDivider-CMgOCZ_h.js";/* empty css              */const _e=re({...oe(),...se(),...ee(),strict:Boolean,modelValue:{type:Array,default:()=>[0,0]}},"VRangeSlider"),y=ie()({name:"VRangeSlider",props:_e(),emits:{"update:focused":e=>!0,"update:modelValue":e=>!0,end:e=>!0,start:e=>!0},setup(e,s){let{slots:u,emit:o}=s;const l=_(),i=_(),h=_(),{rtlClasses:j}=de();function M(m){if(!l.value||!i.value)return;const p=E(m,l.value.$el,e.direction),r=E(m,i.value.$el,e.direction),n=Math.abs(p),b=Math.abs(r);return n<b||n===b&&p<0?l.value.$el:i.value.$el}const U=le(e),a=ce(e,"modelValue",void 0,m=>m!=null&&m.length?m.map(p=>U.roundValue(p)):[0,0]),{activeThumbRef:V,hasLabels:H,max:z,min:I,mousePressed:J,onSliderMousedown:K,onSliderTouchstart:Q,position:L,trackContainerRef:X,readonly:A}=te({props:e,steps:U,onSliderStart:()=>{o("start",a.value)},onSliderEnd:m=>{var n;let{value:p}=m;const r=V.value===((n=l.value)==null?void 0:n.$el)?[p,a.value[1]]:[a.value[0],p];!e.strict&&r[0]<r[1]&&(a.value=r),o("end",a.value)},onSliderMove:m=>{var b,w,D,f;let{value:p}=m;const[r,n]=a.value;!e.strict&&r===n&&r!==I.value&&(V.value=p>r?(b=i.value)==null?void 0:b.$el:(w=l.value)==null?void 0:w.$el,(D=V.value)==null||D.focus()),V.value===((f=l.value)==null?void 0:f.$el)?a.value=[Math.min(p,n),n]:a.value=[r,Math.max(r,p)]},getActiveThumb:M}),{isFocused:B,focus:N,blur:O}=ue(e),W=G(()=>L(a.value[0])),Y=G(()=>L(a.value[1]));return me(()=>{const m=Z.filterProps(e),p=!!(e.label||u.label||u.prepend);return t(Z,ve({class:["v-slider","v-range-slider",{"v-slider--has-labels":!!u["tick-label"]||H.value,"v-slider--focused":B.value,"v-slider--pressed":J.value,"v-slider--disabled":e.disabled},j.value,e.class],style:e.style,ref:h},m,{focused:B.value}),{...u,prepend:p?r=>{var n,b;return t(pe,null,[((n=u.label)==null?void 0:n.call(u,r))??(e.label?t(ne,{class:"v-slider__label",text:e.label},null):void 0),(b=u.prepend)==null?void 0:b.call(u,r)])}:void 0,default:r=>{var w,D;let{id:n,messagesId:b}=r;return t("div",{class:"v-slider__container",onMousedown:A.value?void 0:K,onTouchstartPassive:A.value?void 0:Q},[t("input",{id:`${n.value}_start`,name:e.name||n.value,disabled:!!e.disabled,readonly:!!e.readonly,tabindex:"-1",value:a.value[0]},null),t("input",{id:`${n.value}_stop`,name:e.name||n.value,disabled:!!e.disabled,readonly:!!e.readonly,tabindex:"-1",value:a.value[1]},null),t(ae,{ref:X,start:W.value,stop:Y.value},{"tick-label":u["tick-label"]}),t(q,{ref:l,"aria-describedby":b.value,focused:B&&V.value===((w=l.value)==null?void 0:w.$el),modelValue:a.value[0],"onUpdate:modelValue":f=>a.value=[f,a.value[1]],onFocus:f=>{var T,C,F,P;N(),V.value=(T=l.value)==null?void 0:T.$el,a.value[0]===a.value[1]&&a.value[1]===I.value&&f.relatedTarget!==((C=i.value)==null?void 0:C.$el)&&((F=l.value)==null||F.$el.blur(),(P=i.value)==null||P.$el.focus())},onBlur:()=>{O(),V.value=void 0},min:I.value,max:a.value[1],position:W.value,ripple:e.ripple},{"thumb-label":u["thumb-label"]}),t(q,{ref:i,"aria-describedby":b.value,focused:B&&V.value===((D=i.value)==null?void 0:D.$el),modelValue:a.value[1],"onUpdate:modelValue":f=>a.value=[a.value[0],f],onFocus:f=>{var T,C,F,P;N(),V.value=(T=i.value)==null?void 0:T.$el,a.value[0]===a.value[1]&&a.value[0]===z.value&&f.relatedTarget!==((C=l.value)==null?void 0:C.$el)&&((F=i.value)==null||F.$el.blur(),(P=l.value)==null||P.$el.focus())},onBlur:()=>{O(),V.value=void 0},min:a.value[0],max:z.value,position:Y.value,ripple:e.ripple},{"thumb-label":u["thumb-label"]})])}})}),{}}}),he=g({__name:"DemoRangeSliderVertical",setup(e){const s=_([20,40]);return(u,o)=>(S(),R(y,{modelValue:$(s),"onUpdate:modelValue":o[0]||(o[0]=l=>k(s)?s.value=l:null),direction:"vertical"},null,8,["modelValue"]))}}),ge=g({__name:"DemoRangeSliderThumbLabel",setup(e){const s=["Winter","Spring","Summer","Fall"],u=["bx-cloud-snow","bx-leaf","bx-bxs-hot","bx-droplet"],o=_([1,2]);return(l,i)=>(S(),R(y,{modelValue:$(o),"onUpdate:modelValue":i[0]||(i[0]=h=>k(o)?o.value=h:null),tick:s,min:"0",max:"3",step:1,"show-ticks":"always","thumb-label":"","tick-size":"4"},{"thumb-label":d(({modelValue:h})=>[t(be,{icon:u[h]},null,8,["icon"])]),_:1},8,["modelValue"]))}}),Se=g({__name:"DemoRangeSliderStep",setup(e){const s=_([20,40]);return(u,o)=>(S(),R(y,{modelValue:$(s),"onUpdate:modelValue":o[0]||(o[0]=l=>k(s)?s.value=l:null),step:"10"},null,8,["modelValue"]))}}),Re=g({__name:"DemoRangeSliderColor",setup(e){const s=_([10,60]);return(u,o)=>(S(),R(y,{modelValue:$(s),"onUpdate:modelValue":o[0]||(o[0]=l=>k(s)?s.value=l:null),color:"success"},null,8,["modelValue"]))}}),xe=g({__name:"DemoRangeSliderDisabled",setup(e){const s=_([30,60]);return(u,o)=>(S(),R(y,{modelValue:$(s),"onUpdate:modelValue":o[0]||(o[0]=l=>k(s)?s.value=l:null),disabled:"",label:"Disabled"},null,8,["modelValue"]))}}),$e=g({__name:"DemoRangeSliderBasic",setup(e){const s=_([10,60]);return(u,o)=>(S(),R(y,{modelValue:$(s),"onUpdate:modelValue":o[0]||(o[0]=l=>k(s)?s.value=l:null)},null,8,["modelValue"]))}}),ke={ts:`<script setup lang="ts">
const sliderValues = ref([10, 60])
<\/script>

<template>
  <VRangeSlider v-model="sliderValues" />
</template>
`,js:`<script setup>
const sliderValues = ref([
  10,
  60,
])
<\/script>

<template>
  <VRangeSlider v-model="sliderValues" />
</template>
`},ye={ts:`<script lang="ts" setup>
const sliderValues = ref([10, 60])
<\/script>

<template>
  <VRangeSlider
    v-model="sliderValues"
    color="success"
  />
</template>
`,js:`<script setup>
const sliderValues = ref([
  10,
  60,
])
<\/script>

<template>
  <VRangeSlider
    v-model="sliderValues"
    color="success"
  />
</template>
`},we={ts:`<script lang="ts" setup>
const slidersValues = ref([30, 60])
<\/script>

<template>
  <VRangeSlider
    v-model="slidersValues"
    disabled
    label="Disabled"
  />
</template>
`,js:`<script setup>
const slidersValues = ref([
  30,
  60,
])
<\/script>

<template>
  <VRangeSlider
    v-model="slidersValues"
    disabled
    label="Disabled"
  />
</template>
`},De={ts:`<script lang="ts" setup>
const sliderValues = ref([20, 40])
<\/script>

<template>
  <VRangeSlider
    v-model="sliderValues"
    step="10"
  />
</template>
`,js:`<script setup>
const sliderValues = ref([
  20,
  40,
])
<\/script>

<template>
  <VRangeSlider
    v-model="sliderValues"
    step="10"
  />
</template>
`},Te={ts:`<script lang="ts" setup>
const seasons = ['Winter', 'Spring', 'Summer', 'Fall']
const icons = ['bx-cloud-snow', 'bx-leaf', 'bx-bxs-hot', 'bx-droplet']
const sliderValues = ref([1, 2])
<\/script>

<template>
  <VRangeSlider
    v-model="sliderValues"
    :tick="seasons"
    min="0"
    max="3"
    :step="1"
    show-ticks="always"
    thumb-label
    tick-size="4"
  >
    <template #thumb-label="{ modelValue }">
      <VIcon :icon="icons[modelValue]" />
    </template>
  </VRangeSlider>
</template>
`,js:`<script setup>
const seasons = [
  'Winter',
  'Spring',
  'Summer',
  'Fall',
]

const icons = [
  'bx-cloud-snow',
  'bx-leaf',
  'bx-bxs-hot',
  'bx-droplet',
]

const sliderValues = ref([
  1,
  2,
])
<\/script>

<template>
  <VRangeSlider
    v-model="sliderValues"
    :tick="seasons"
    min="0"
    max="3"
    :step="1"
    show-ticks="always"
    thumb-label
    tick-size="4"
  >
    <template #thumb-label="{ modelValue }">
      <VIcon :icon="icons[modelValue]" />
    </template>
  </VRangeSlider>
</template>
`},Ce={ts:`<script lang="ts" setup>
const sliderValues = ref([20, 40])
<\/script>

<template>
  <VRangeSlider
    v-model="sliderValues"
    direction="vertical"
  />
</template>
`,js:`<script setup>
const sliderValues = ref([
  20,
  40,
])
<\/script>

<template>
  <VRangeSlider
    v-model="sliderValues"
    direction="vertical"
  />
</template>
`},Fe=c("p",null,[v("The "),c("code",null,"v-slider"),v(" component is a better visualization of the number input.")],-1),Pe=c("p",null,[v("You cannot interact with "),c("code",null,"disabled"),v(" sliders.")],-1),Ue=c("p",null,[v("Use "),c("code",null,"color"),v(" prop to the sets the slider color. "),c("code",null,"track-color"),v(" prop to sets the color of slider's unfilled track.")],-1),Be=c("p",null,[c("code",null,"v-range-slider"),v(" can have steps other than 1. This can be helpful for some applications where you need to adjust values with more or less accuracy.")],-1),je=c("p",null,[v(" Using the "),c("code",null,"tick-labels"),v(" prop along with the "),c("code",null,"thumb-label"),v(" slot, you can create a very customized solution. ")],-1),Me=c("p",null,[v("You can use the "),c("code",null,"vertical"),v(" prop to switch sliders to a vertical orientation. If you need to change the height of the slider, use css.")],-1),Je=g({__name:"range-slider",setup(e){return(s,u)=>{const o=$e,l=Ve,i=xe,h=Re,j=Se,M=ge,U=he;return S(),R(fe,null,{default:d(()=>[t(x,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Basic",code:ke},{default:d(()=>[Fe,t(o)]),_:1},8,["code"])]),_:1}),t(x,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Disabled",code:we},{default:d(()=>[Pe,t(i)]),_:1},8,["code"])]),_:1}),t(x,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Color",code:ye},{default:d(()=>[Ue,t(h)]),_:1},8,["code"])]),_:1}),t(x,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Step",code:De},{default:d(()=>[Be,t(j)]),_:1},8,["code"])]),_:1}),t(x,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Thumb label",code:Te},{default:d(()=>[je,t(M)]),_:1},8,["code"])]),_:1}),t(x,{cols:"12",md:"6"},{default:d(()=>[t(l,{title:"Vertical",code:Ce},{default:d(()=>[Me,t(U)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{Je as default};
