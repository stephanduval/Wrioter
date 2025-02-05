import{d as v,r as f,o as r,g,f as o,b as e,a2 as S,q as U,n as c,ah as u,K as h,c as V,e as l,v as j,F as x,i as k,t as s}from"./main-Ca4qx7y-.js";import{V as i}from"./VRating-CiHq4OZA.js";import{V as F}from"./VSlider-CNzfrSxg.js";import{_ as I}from"./AppCardCode.vue_vue_type_style_index_0_lang-Bq5KC9kd.js";import{a as p,V as B}from"./VRow-EsZ_8CZn.js";import"./VSliderTrack-Dc_EYP4A.js";import"./VInput-iEBwr0fp.js";import"./form-C6PetfES.js";import"./VImg-C3GobFkp.js";import"./vue3-perfect-scrollbar.esm-CLCcbP0n.js";import"./VCard-k3dQT3Up.js";import"./VAvatar-B3k1LwfD.js";import"./VCardText-iX3erHMv.js";import"./VDivider-CMgOCZ_h.js";/* empty css              */const T=v({__name:"DemoRatingItemSlot",setup(m){const t=f(4.5);return(d,a)=>(r(),g(i,{modelValue:c(t),"onUpdate:modelValue":a[0]||(a[0]=n=>u(t)?t.value=n:null)},{item:o(n=>[e(S,U(n,{size:25,color:n.isFilled?"success":"secondary",class:"me-3",icon:n.isFilled?"bx-smile":"bx-sad"}),null,16,["color","icon"])]),_:1},8,["modelValue"]))}}),L=v({__name:"DemoRatingIncremented",setup(m){const t=f(4.5);return(d,a)=>(r(),g(i,{modelValue:c(t),"onUpdate:modelValue":a[0]||(a[0]=n=>u(t)?t.value=n:null),"half-increments":"",hover:""},null,8,["modelValue"]))}}),M={};function N(m,t){return r(),g(i,{hover:""})}const H=h(M,[["render",N]]),P={};function q(m,t){return r(),g(i,{readonly:"","model-value":4})}const A=h(P,[["render",q]]),E={};function K(m,t){return r(),g(i,{clearable:""})}const G=h(E,[["render",K]]),J=l("div",{class:"text-caption"}," Custom length ",-1),O={class:"font-weight-medium mb-0"},Q=v({__name:"DemoRatingLength",setup(m){const t=f(5),d=f(2);return(a,n)=>(r(),V(x,null,[J,e(F,{modelValue:c(t),"onUpdate:modelValue":n[0]||(n[0]=_=>u(t)?t.value=_:null),min:1,max:7},null,8,["modelValue"]),e(i,{modelValue:c(d),"onUpdate:modelValue":n[1]||(n[1]=_=>u(d)?d.value=_:null),length:c(t)},null,8,["modelValue","length"]),l("p",O," Model: "+j(c(d)),1)],64))}}),W={class:"d-flex flex-column"},X=v({__name:"DemoRatingSize",setup(m){const t=f(4);return(d,a)=>(r(),V("div",W,[e(i,{modelValue:c(t),"onUpdate:modelValue":a[0]||(a[0]=n=>u(t)?t.value=n:null),size:"small"},null,8,["modelValue"]),e(i,{modelValue:c(t),"onUpdate:modelValue":a[1]||(a[1]=n=>u(t)?t.value=n:null)},null,8,["modelValue"]),e(i,{modelValue:c(t),"onUpdate:modelValue":a[2]||(a[2]=n=>u(t)?t.value=n:null),size:"large"},null,8,["modelValue"]),e(i,{modelValue:c(t),"onUpdate:modelValue":a[3]||(a[3]=n=>u(t)?t.value=n:null),size:"x-large"},null,8,["modelValue"])]))}}),Y={class:"d-flex flex-column"},Z=v({__name:"DemoRatingColors",setup(m){const t=f(4),d=["primary","secondary","success","info","error"];return(a,n)=>(r(),V("div",Y,[(r(),V(x,null,k(d,_=>e(i,{key:_,modelValue:c(t),"onUpdate:modelValue":n[0]||(n[0]=R=>u(t)?t.value=R:null),color:_},null,8,["modelValue","color"])),64))]))}}),ee={};function te(m,t){return r(),g(i,{density:"compact"})}const ne=h(ee,[["render",te]]),oe={};function le(m,t){return r(),g(i)}const ae=h(oe,[["render",le]]),se={ts:`<template>
  <VRating />
</template>
`,js:`<template>
  <VRating />
</template>
`},ie={ts:`<template>
  <VRating clearable />
</template>
`,js:`<template>
  <VRating clearable />
</template>
`},re={ts:`<script lang="ts" setup>
const rating = ref(4)
const ratingColors = ['primary', 'secondary', 'success', 'info', 'error']
<\/script>

<template>
  <div class="d-flex flex-column">
    <VRating
      v-for="color in ratingColors"
      :key="color"
      v-model="rating"
      :color="color"
    />
  </div>
</template>
`,js:`<script setup>
const rating = ref(4)

const ratingColors = [
  'primary',
  'secondary',
  'success',
  'info',
  'error',
]
<\/script>

<template>
  <div class="d-flex flex-column">
    <VRating
      v-for="color in ratingColors"
      :key="color"
      v-model="rating"
      :color="color"
    />
  </div>
</template>
`},ce={ts:`<template>
  <VRating density="compact" />
</template>
`,js:`<template>
  <VRating density="compact" />
</template>
`},me={ts:`<template>
  <VRating hover />
</template>
`,js:`<template>
  <VRating hover />
</template>
`},de={ts:`<script lang="ts" setup>
const rating = ref(4.5)
<\/script>

<template>
  <VRating
    v-model="rating"
    half-increments
    hover
  />
</template>
`,js:`<script setup>
const rating = ref(4.5)
<\/script>

<template>
  <VRating
    v-model="rating"
    half-increments
    hover
  />
</template>
`},pe={ts:`<script lang="ts" setup>
const rating = ref(4.5)
<\/script>

<template>
  <VRating v-model="rating">
    <template #item="props">
      <VIcon
        v-bind="props"
        :size="25"
        :color="props.isFilled ? 'success' : 'secondary'"
        class="me-3"
        :icon="props.isFilled ? 'bx-smile' : 'bx-sad'"
      />
    </template>
  </VRating>
</template>
`,js:`<script setup>
const rating = ref(4.5)
<\/script>

<template>
  <VRating v-model="rating">
    <template #item="props">
      <VIcon
        v-bind="props"
        :size="25"
        :color="props.isFilled ? 'success' : 'secondary'"
        class="me-3"
        :icon="props.isFilled ? 'bx-smile' : 'bx-sad'"
      />
    </template>
  </VRating>
</template>
`},ue={ts:`<script lang="ts" setup>
const length = ref(5)
const rating = ref(2)
<\/script>

<template>
  <div class="text-caption">
    Custom length
  </div>

  <VSlider
    v-model="length"
    :min="1"
    :max="7"
  />

  <VRating
    v-model="rating"
    :length="length"
  />
  <p class="font-weight-medium mb-0">
    Model: {{ rating }}
  </p>
</template>
`,js:`<script setup>
const length = ref(5)
const rating = ref(2)
<\/script>

<template>
  <div class="text-caption">
    Custom length
  </div>

  <VSlider
    v-model="length"
    :min="1"
    :max="7"
  />

  <VRating
    v-model="rating"
    :length="length"
  />
  <p class="font-weight-medium mb-0">
    Model: {{ rating }}
  </p>
</template>
`},_e={ts:`<template>
  <VRating
    readonly
    :model-value="4"
  />
</template>
`,js:`<template>
  <VRating
    readonly
    :model-value="4"
  />
</template>
`},ge={ts:`<script lang="ts" setup>
const rating = ref(4)
<\/script>

<template>
  <div class="d-flex flex-column">
    <VRating
      v-model="rating"
      size="small"
    />

    <VRating v-model="rating" />

    <VRating
      v-model="rating"
      size="large"
    />

    <VRating
      v-model="rating"
      size="x-large"
    />
  </div>
</template>
`,js:`<script setup>
const rating = ref(4)
<\/script>

<template>
  <div class="d-flex flex-column">
    <VRating
      v-model="rating"
      size="small"
    />

    <VRating v-model="rating" />

    <VRating
      v-model="rating"
      size="large"
    />

    <VRating
      v-model="rating"
      size="x-large"
    />
  </div>
</template>
`},fe=l("p",null,[s("The "),l("code",null,"v-rating"),s(" component provides a simple interface for gathering user feedback.")],-1),ve=l("p",null,[s("Control the space occupied by "),l("code",null,"v-rating"),s(" items using the "),l("code",null,"density"),s(" prop.")],-1),he=l("p",null,[s("The "),l("code",null,"v-rating"),s(" component can be colored as you want, you can set both selected and not selected colors.")],-1),Ve=l("p",null,[s("Utilize the same sizing classes available in "),l("code",null,"v-icon"),s(" or provide your own with the "),l("code",null,"size"),s(" prop.")],-1),Re=l("p",null,[s("Change the number of items by modifying the the "),l("code",null,"length"),s(" prop.")],-1),xe=l("p",null,[s("Use "),l("code",null,"clearable"),s(" prop to allows for the component to be cleared. Triggers when the icon containing the current value is clicked.")],-1),ye=l("p",null,[s("For ratings that are not meant to be changed you can use "),l("code",null,"readonly"),s(" prop.")],-1),be=l("p",null,"Provides visual feedback when hovering over icons",-1),ze=l("p",null,[s("The "),l("code",null,"half-increments"),s(" prop increases the granularity of the ratings, allow for .5 values as well.")],-1),Ce=l("p",null,"Slots enable advanced customization possibilities and provide you with more freedom in how you display the rating.",-1),Pe=v({__name:"rating",setup(m){return(t,d)=>{const a=ae,n=I,_=ne,R=Z,y=X,b=Q,z=G,C=A,$=H,D=L,w=T;return r(),g(B,{class:"match-height"},{default:o(()=>[e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Basic",code:se},{default:o(()=>[fe,e(a)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Density",code:ce},{default:o(()=>[ve,e(_)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Colors",code:re},{default:o(()=>[he,e(R)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Size",code:ge},{default:o(()=>[Ve,e(y)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Length",code:ue},{default:o(()=>[Re,e(b)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Clearable",code:ie},{default:o(()=>[xe,e(z)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Readonly",code:_e},{default:o(()=>[ye,e(C)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Hover",code:me},{default:o(()=>[be,e($)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Incremented",code:de},{default:o(()=>[ze,e(D)]),_:1},8,["code"])]),_:1}),e(p,{cols:"12",md:"6"},{default:o(()=>[e(n,{title:"Item slot",code:pe},{default:o(()=>[Ce,e(w)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{Pe as default};
