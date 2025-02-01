import{d as m,r as O,o as s,c as n,e as f,F as l,i as w,v as F,n as e,b as r,f as t,t as y,am as k,ag as S,K as B,a2 as q,g as le}from"./main-BaC4daP5.js";import{r as g}from"./swiper-element-bundle-CgFmIXxP.js";import{V as b}from"./VImg-DaBIesWz.js";import{V as K}from"./VCardText-yg2yyEKt.js";import{V as H}from"./VCard-B5K8V0Oe.js";import{_ as we}from"./AppCardCode.vue_vue_type_style_index_0_lang-CUZ3RA7S.js";import{a as d,V as me}from"./VRow-MD441sKt.js";import"./VAvatar-C7kH6m2U.js";import"./vue3-perfect-scrollbar.esm-DnoJNS1m.js";import"./VDivider-OHXYM3-S.js";/* empty css              */const ce={class:"swiper-virtual"},de=["slides"],ge={class:"text-secondary"},be={class:"d-flex justify-center gap-4 flex-wrap"},ue=m({__name:"DemoSwiperVirtualSlides",setup(c){g();const o=Array.from({length:500},(v,u)=>`Slides ${u+1}`),a=O(null),i=O(1),p=O(500),j=v=>{var u;(u=a.value)==null||u.swiper.slideTo(v-1)},U=()=>{var v;(v=a.value)==null||v.swiper.prependSlide([`<swiper-slide>Slide ${--i.value} </swiper-slide>`,`<swiper-slide>Slide ${--i.value} </swiper-slide>`])},T=()=>{var v;(v=a.value)==null||v.swiper.appendSlide([`<swiper-slide>Slide ${++p.value} </swiper-slide>`])};return(v,u)=>(s(),n("section",ce,[f("swiper-container",{ref_key:"swiperEl",ref:a,virtual:"true",slides:e(o),navigation:"true","slides-per-view":"5","space-between":"50","free-mode":"true","events-prefix":"swiper-",breakpoints:{1024:{slidesPerView:4,spaceBetween:40},768:{slidesPerView:3,spaceBetween:30},640:{slidesPerView:2,spaceBetween:20},320:{slidesPerView:1,spaceBetween:10}}},[(s(!0),n(l,null,w(e(o),(_,L)=>(s(),n("swiper-slide",{key:L},[f("div",ge,F(_),1)]))),128))],8,de),f("div",be,[r(S,{variant:"outlined",color:"primary",onClick:k(U,["prevent"])},{default:t(()=>[y(" Prepend 2 Slides ")]),_:1}),r(S,{variant:"outlined",color:"primary",onClick:u[0]||(u[0]=k(_=>j(1),["prevent"]))},{default:t(()=>[y(" Slide 1 ")]),_:1}),r(S,{variant:"outlined",color:"primary",onClick:u[1]||(u[1]=k(_=>j(250),["prevent"]))},{default:t(()=>[y(" Slide 250 ")]),_:1}),r(S,{variant:"outlined",color:"primary",onClick:u[2]||(u[2]=k(_=>j(500),["prevent"]))},{default:t(()=>[y(" Slide 500 ")]),_:1}),r(S,{variant:"outlined",color:"primary",onClick:k(T,["prevent"])},{default:t(()=>[y(" Append Slide ")]),_:1})])]))}}),z="/build/assets/banner-31-D6mS0gQn.jpg",P="/build/assets/banner-32-B8kg_gZc.jpg",D="/build/assets/banner-33-DfQ0Urdo.jpg",G="/build/assets/banner-34-CMWn1p69.jpg",E="/build/assets/banner-35-avrf_yoA.jpg",Z="/build/assets/banner-36-BiLQv0qP.jpg",J="/build/assets/banner-37-CxyHDUrj.jpg",X="/build/assets/5-CFPERer_.jpg",$="/build/assets/banner-39-D9mpewKd.jpg",fe={"pagination-clickable":"true","slides-per-view":"5","space-between":"50","events-prefix":"swiper-",breakpoints:{1024:{slidesPerView:4,spaceBetween:40},768:{slidesPerView:3,spaceBetween:30},640:{slidesPerView:2,spaceBetween:20},320:{slidesPerView:1,spaceBetween:10}}},ve=m({__name:"DemoSwiperResponsiveBreakpoints",setup(c){return g(),(o,a)=>(s(),n("swiper-container",fe,[(s(!0),n(l,null,w([e(z),e(P),e(D),e(G),e(E),e(Z),e(J),e(X),e($)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),C="/build/assets/banner-20-D60huBoA.jpg",N="/build/assets/banner-4-EPycabrm.jpg",Y="/build/assets/banner-5-DVgdLDIC.jpg",x="/build/assets/banner-7-C3Ec249A.jpg",A="/build/assets/banner-8-CS7lrdd8.jpg",W="/build/assets/banner-9-CN54Uf8b.jpg",_e={"pagination-clickable":"true",autoplay:"true",navigation:"true","events-prefix":"swiper-"},xe=m({__name:"DemoSwiperLazyLoading",setup(c){return g(),(o,a)=>(s(),n("swiper-container",_e,[(s(!0),n(l,null,w([e(N),e(Y),e(W),e(x),e(A),e(C)],i=>(s(),n("swiper-slide",{key:i,lazy:"true"},[r(b,{src:i,cover:"",loading:"lazy"},null,8,["src"])]))),128))]))}}),V="/build/assets/banner-11-ClWmypCi.jpg",I="/build/assets/6-C2cDgitj.jpg",h="/build/assets/banner-13-Cforbb5S.jpg",M="/build/assets/banner-15-DVoX7is_.jpg",Q="/build/assets/banner-16-BBt3y7wv.jpg",je={class:"mySwiper","thumbs-swiper":".mySwiper2",loop:"true","space-between":"10",navigation:"true","centered-slides":"true","events-prefix":"swiper-"},ye={class:"mySwiper2",loop:"true","free-mode":"true","events-prefix":"swiper-","slides-per-view":"4"},ke=m({__name:"DemoSwiperGallery",setup(c){return g(),(o,a)=>(s(),n(l,null,[f("swiper-container",je,[(s(!0),n(l,null,w([e(V),e(I),e(h),e(M),e(Q),e(V),e(I),e(h)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i,cover:""},null,8,["src"])]))),128))]),f("swiper-container",ye,[(s(!0),n(l,null,w([e(V),e(I),e(h),e(M),e(Q),e(V),e(I),e(h)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i,cover:""},null,8,["src"])]))),128))])],64))}}),Se=B(ke,[["__scopeId","data-v-c40556ae"]]),Ve="/build/assets/banner-10-C2w4rcW8.jpg",Ie={pagination:"true",navigation:"true",autoplay:"true","centered-slides":"true","events-prefix":"swiper-"},he=m({__name:"DemoSwiperAutoplay",setup(c){return g(),(o,a)=>(s(),n("swiper-container",Ie,[(s(!0),n(l,null,w([e(x),e(A),e(W),e(Ve),e(V),e(C)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i,cover:""},null,8,["src"])]))),128))]))}}),Be={pagination:"true",effect:"coverflow","grab-cursor":"true","centered-slides":"true","slides-per-view":"auto","coverflow-effect-rotate":"50","coverflow-effect-stretch":"0","coverflow-effect-depth":"100","coverflow-effect-modifier":"1","coverflow-effect-slide-shadows":"true","events-prefix":"swiper-"},Pe=m({__name:"DemoSwiperCoverflowEffect",setup(c){return g(),(o,a)=>(s(),n("swiper-container",Be,[(s(!0),n(l,null,w([e(z),e(P),e(D),e(G),e(E),e(Z),e(J),e(X),e($)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),Ce=B(Pe,[["__scopeId","data-v-7101afac"]]),$e="/build/assets/banner-21-BbDBzY5j.jpg",ze="/build/assets/banner-23-eu_41WqH.jpg",De="/build/assets/banner-24-BNOF4zrU.jpg",Ge={pagination:"true","centered-slides":"true",effect:"cube","grab-cursor":"true","cube-effect-shadow":"true","cube-effect-slide-shadows":"true","cube-effect-shadow-scale":"0.94","events-prefix":"swiper-"},Ee=m({__name:"DemoSwiperCubeEffect",setup(c){return g(),(o,a)=>(s(),n("swiper-container",Ge,[(s(!0),n(l,null,w([e($e),e(P),e(ze),e(De)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),Ne=B(Ee,[["__scopeId","data-v-9cdf68f6"]]),Ae="/build/assets/banner-17-vuA5wUeU.jpg",Ue="/build/assets/banner-18-rnuWLp8J.jpg",Te="/build/assets/banner-19-DKrHObKZ.jpg",Le={"space-between":"30",pagination:"true",navigation:"true",effect:"fade","events-prefix":"swiper-"},Oe=m({__name:"DemoSwiperFade",setup(c){return g(),(o,a)=>(s(),n("swiper-container",Le,[(s(!0),n(l,null,w([e(C),e(Te),e(Ue),e(Ae),e(Q)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),Qe={"centered-slides":"true","space-between":"30","slides-per-view":"1","events-prefix":"swiper-",breakpoints:{992:{slidesPerView:4,spaceBetween:30},780:{slidesPerView:3,spaceBetween:30},460:{slidesPerView:2,spaceBetween:20}}},Fe={class:"d-flex align-center gap-x-3"},We={class:"font-weight-medium"},Me=m({__name:"DemoSwiperCenteredSlidesOption2",setup(c){return g(),(o,a)=>(s(),n("swiper-container",Qe,[(s(),n(l,null,w([{icon:"bx-bxl-github",text:"Getting Started"},{icon:"bx-bxl-facebook",text:"Pricing & Plans"},{icon:"bx-bxl-twitter",text:"Sales Question"},{icon:"bx-bxl-instagram",text:"Usage Guidelines"},{icon:"bx-bxl-gitlab",text:"General Guide"}],({icon:i,text:p})=>f("swiper-slide",{key:p},[r(H,{class:"bg-default"},{default:t(()=>[r(K,null,{default:t(()=>[f("div",Fe,[r(q,{icon:i,size:"28"},null,8,["icon"]),f("span",We,F(p),1)])]),_:2},1024)]),_:2},1024)])),64))]))}}),Re=B(Me,[["__scopeId","data-v-550e8726"]]),qe={class:"swiper-centered-slide"},Ke={navigation:"true","centered-slides":"true","space-between":"30","slides-per-view":"1","events-prefix":"swiper-",injectStyles:[`
        .swiper-button-next, .swiper-button-prev{
          background: rgb(var(--v-theme-primary)) !important;
          color: #fff !important;
          padding-inline: 0.45rem !important;
          padding-block: 0.45rem !important;
          inline-size: 1rem !important;
          block-size: 1rem !important;
          border-radius: 50%
        }
        `],breakpoints:{992:{slidesPerView:4,spaceBetween:30},780:{slidesPerView:3,spaceBetween:30},460:{slidesPerView:2,spaceBetween:20}}},He={class:"d-flex flex-column align-center gap-y-3"},Ze={class:"text-high-emphasis"},Je=m({__name:"DemoSwiperCenteredSlidesOption1",setup(c){return g(),(o,a)=>(s(),n("div",qe,[f("swiper-container",Ke,[(s(),n(l,null,w([{icon:"bx-bxl-github",text:"Getting Started"},{icon:"bx-bxl-facebook",text:"Pricing & Plans"},{icon:"bx-bxl-twitter",text:"Sales Question"},{icon:"bx-bxl-instagram",text:"Usage Guidelines"},{icon:"bx-bxl-gitlab",text:"General Guide"}],({icon:i,text:p})=>f("swiper-slide",{key:p},[r(H,null,{default:t(()=>[r(K,null,{default:t(()=>[f("div",He,[r(q,{icon:i,size:"28"},null,8,["icon"]),f("span",Ze,F(p),1)])]),_:2},1024)]),_:2},1024)])),64))])]))}}),Xe=B(Je,[["__scopeId","data-v-a314a0d6"]]),R="/build/assets/banner-26-Co29d348.jpg",Ye="/build/assets/banner-28-BavDZX16.jpg",er="/build/assets/banner-29-Bw5q4Gpe.jpg",rr="/build/assets/banner-30-BcnSNmsG.jpg",ir={"slides-per-view":"4","grid-fill":"rows","space-between":"30","grid-rows":"2","pagination-clickable":"true","events-prefix":"swiper-"},sr=m({__name:"DemoSwiperGrid",setup(c){return g(),(o,a)=>(s(),n("swiper-container",ir,[(s(!0),n(l,null,w([e(R),e($),e(Ye),e(er),e(rr),e(z),e(P),e(D),e(G),e(E),e(R),e($)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),nr={pagination:"true","slides-per-view":"3","space-between":"25","events-prefix":"swiper-"},tr=m({__name:"DemoSwiperMultipleSlidesPerView",setup(c){return g(),(o,a)=>(s(),n("swiper-container",nr,[(s(!0),n(l,null,w([e(z),e(P),e(D),e(G),e(E)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),pr={navigation:"true","pagination-type":"progressbar","events-prefix":"swiper-"},ar=m({__name:"DemoSwiperProgress",setup(c){return g(),(o,a)=>(s(),n("swiper-container",pr,[(s(!0),n(l,null,w([e(A),e(x),e(C),e(N),e(Y)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),or={pagination:"true","events-prefix":"swiper-"},lr=m({__name:"DemoSwiperPagination",setup(c){return g(),(o,a)=>(s(),n("swiper-container",or,[(s(!0),n(l,null,w([e(I),e(W),e(A),e(x),e(C)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),wr="/build/assets/banner-14-bNfFS-GU.jpg",ee="/build/assets/banner-2-SWMk04gr.jpg",mr="/build/assets/banner-3-S5UpPGOJ.jpg",cr={navigation:"true","events-prefix":"swiper-"},dr=m({__name:"DemoSwiperNavigation",setup(c){return g(),(o,a)=>(s(),n("swiper-container",cr,[(s(!0),n(l,null,w([e(x),e(N),e(wr),e(mr),e(ee)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),gr="/build/assets/banner-1-rgqr7rAW.jpg",br={"events-prefix":"swiper-"},ur=m({__name:"DemoSwiperBasic",setup(c){return g(),(o,a)=>(s(),n("swiper-container",br,[(s(!0),n(l,null,w([e(gr),e(ee),e(N),e(x),e(h)],i=>(s(),n("swiper-slide",{key:i},[r(b,{src:i},null,8,["src"])]))),128))]))}}),fr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper10 from '@images/banner/banner-10.jpg'
import swiper11 from '@images/banner/banner-11.jpg'
import swiper20 from '@images/banner/banner-20.jpg'
import swiper7 from '@images/banner/banner-7.jpg'
import swiper8 from '@images/banner/banner-8.jpg'
import swiper9 from '@images/banner/banner-9.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    navigation="true"
    autoplay="true"
    centered-slides="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in
        [
          swiper7,
          swiper8,
          swiper9,
          swiper10,
          swiper11,
          swiper20,
        ]"
      :key="swiperImg"
    >
      <VImg
        :src="swiperImg"
        cover
      />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper10 from '@images/banner/banner-10.jpg'
import swiper11 from '@images/banner/banner-11.jpg'
import swiper20 from '@images/banner/banner-20.jpg'
import swiper7 from '@images/banner/banner-7.jpg'
import swiper8 from '@images/banner/banner-8.jpg'
import swiper9 from '@images/banner/banner-9.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    navigation="true"
    autoplay="true"
    centered-slides="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in
        [
          swiper7,
          swiper8,
          swiper9,
          swiper10,
          swiper11,
          swiper20,
        ]"
      :key="swiperImg"
    >
      <VImg
        :src="swiperImg"
        cover
      />
    </swiper-slide>
  </swiper-container>
</template>
`},vr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'

import swiper1 from '@images/banner/banner-1.jpg'
import swiper13 from '@images/banner/banner-13.jpg'
import swiper2 from '@images/banner/banner-2.jpg'
import swiper4 from '@images/banner/banner-4.jpg'
import swiper7 from '@images/banner/banner-7.jpg'

register()
<\/script>

<template>
  <swiper-container events-prefix="swiper-">
    <swiper-slide
      v-for="swiperImg in [
        swiper1,
        swiper2,
        swiper4,
        swiper7,
        swiper13,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper1 from '@images/banner/banner-1.jpg'
import swiper13 from '@images/banner/banner-13.jpg'
import swiper2 from '@images/banner/banner-2.jpg'
import swiper4 from '@images/banner/banner-4.jpg'
import swiper7 from '@images/banner/banner-7.jpg'

register()
<\/script>

<template>
  <swiper-container events-prefix="swiper-">
    <swiper-slide
      v-for="swiperImg in [
        swiper1,
        swiper2,
        swiper4,
        swiper7,
        swiper13,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`},_r={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'

register()
<\/script>

<template>
  <!-- eslint-disable vue/attribute-hyphenation -->
  <div class="swiper-centered-slide">
    <swiper-container
      navigation="true"
      centered-slides="true"
      space-between="30"
      slides-per-view="1"
      events-prefix="swiper-"
      :injectStyles="[
        \`
        .swiper-button-next, .swiper-button-prev{
          background: rgb(var(--v-theme-primary)) !important;
          color: #fff !important;
          padding-inline: 0.45rem !important;
          padding-block: 0.45rem !important;
          inline-size: 1rem !important;
          block-size: 1rem !important;
          border-radius: 50%
        }
        \`,
      ]"
      :breakpoints="{
        992: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
        780: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        460: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
      }"
    >
      <swiper-slide
        v-for="{ icon, text } in [
          { icon: 'bx-bxl-github', text: 'Getting Started' },
          { icon: 'bx-bxl-facebook', text: 'Pricing & Plans' },
          { icon: 'bx-bxl-twitter', text: 'Sales Question' },
          { icon: 'bx-bxl-instagram', text: 'Usage Guidelines' },
          { icon: 'bx-bxl-gitlab', text: 'General Guide' },
        ]"
        :key="text"
      >
        <VCard>
          <VCardText>
            <div class="d-flex flex-column align-center gap-y-3">
              <VIcon
                :icon="icon"
                size="28"
              />
              <span class="text-high-emphasis">{{ text }}</span>
            </div>
          </VCardText>
        </VCard>
      </swiper-slide>
    </swiper-container>
  </div>
</template>

<style lang="scss" scoped>
swiper-slide {
  padding-block: 1rem;

  &.swiper-slide-active {
    .v-card {
      border: 1px solid rgb(var(--v-theme-primary));

      .v-icon {
        color: rgb(var(--v-theme-primary));
      }
    }
  }
}
</style>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'

register()
<\/script>

<template>
  <!-- eslint-disable vue/attribute-hyphenation -->
  <div class="swiper-centered-slide">
    <swiper-container
      navigation="true"
      centered-slides="true"
      space-between="30"
      slides-per-view="1"
      events-prefix="swiper-"
      :injectStyles="[
        \`
        .swiper-button-next, .swiper-button-prev{
          background: rgb(var(--v-theme-primary)) !important;
          color: #fff !important;
          padding-inline: 0.45rem !important;
          padding-block: 0.45rem !important;
          inline-size: 1rem !important;
          block-size: 1rem !important;
          border-radius: 50%
        }
        \`,
      ]"
      :breakpoints="{
        992: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
        780: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        460: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
      }"
    >
      <swiper-slide
        v-for="{ icon, text } in [
          { icon: 'bx-bxl-github', text: 'Getting Started' },
          { icon: 'bx-bxl-facebook', text: 'Pricing & Plans' },
          { icon: 'bx-bxl-twitter', text: 'Sales Question' },
          { icon: 'bx-bxl-instagram', text: 'Usage Guidelines' },
          { icon: 'bx-bxl-gitlab', text: 'General Guide' },
        ]"
        :key="text"
      >
        <VCard>
          <VCardText>
            <div class="d-flex flex-column align-center gap-y-3">
              <VIcon
                :icon="icon"
                size="28"
              />
              <span class="text-high-emphasis">{{ text }}</span>
            </div>
          </VCardText>
        </VCard>
      </swiper-slide>
    </swiper-container>
  </div>
</template>

<style lang="scss" scoped>
swiper-slide {
  padding-block: 1rem;

  &.swiper-slide-active {
    .v-card {
      border: 1px solid rgb(var(--v-theme-primary));

      .v-icon {
        color: rgb(var(--v-theme-primary));
      }
    }
  }
}
</style>
`},xr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'

register()
<\/script>

<template>
  <swiper-container
    centered-slides="true"
    space-between="30"
    slides-per-view="1"
    events-prefix="swiper-"
    :breakpoints="{
      992: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
      780: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      460: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
    }"
  >
    <swiper-slide
      v-for="{ icon, text } in [
        { icon: 'bx-bxl-github', text: 'Getting Started' },
        { icon: 'bx-bxl-facebook', text: 'Pricing & Plans' },
        { icon: 'bx-bxl-twitter', text: 'Sales Question' },
        { icon: 'bx-bxl-instagram', text: 'Usage Guidelines' },
        { icon: 'bx-bxl-gitlab', text: 'General Guide' },
      ]"
      :key="text"
    >
      <VCard class="bg-default">
        <VCardText>
          <div class="d-flex align-center gap-x-3">
            <VIcon
              :icon="icon"
              size="28"
            />
            <span class="font-weight-medium">{{ text }}</span>
          </div>
        </VCardText>
      </VCard>
    </swiper-slide>
  </swiper-container>
</template>

<style lang="scss" scoped>
swiper-slide {
  padding-block: 1rem;

  &.swiper-slide-active {
    .v-card {
      border: 1px solid rgb(var(--v-theme-primary));
      background: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-on-primary));
    }
  }
}
</style>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'

register()
<\/script>

<template>
  <swiper-container
    centered-slides="true"
    space-between="30"
    slides-per-view="1"
    events-prefix="swiper-"
    :breakpoints="{
      992: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
      780: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      460: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
    }"
  >
    <swiper-slide
      v-for="{ icon, text } in [
        { icon: 'bx-bxl-github', text: 'Getting Started' },
        { icon: 'bx-bxl-facebook', text: 'Pricing & Plans' },
        { icon: 'bx-bxl-twitter', text: 'Sales Question' },
        { icon: 'bx-bxl-instagram', text: 'Usage Guidelines' },
        { icon: 'bx-bxl-gitlab', text: 'General Guide' },
      ]"
      :key="text"
    >
      <VCard class="bg-default">
        <VCardText>
          <div class="d-flex align-center gap-x-3">
            <VIcon
              :icon="icon"
              size="28"
            />
            <span class="font-weight-medium">{{ text }}</span>
          </div>
        </VCardText>
      </VCard>
    </swiper-slide>
  </swiper-container>
</template>

<style lang="scss" scoped>
swiper-slide {
  padding-block: 1rem;

  &.swiper-slide-active {
    .v-card {
      border: 1px solid rgb(var(--v-theme-primary));
      background: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-on-primary));
    }
  }
}
</style>
`},jr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper31 from '@images/banner/banner-31.jpg'
import swiper32 from '@images/banner/banner-32.jpg'
import swiper33 from '@images/banner/banner-33.jpg'
import swiper34 from '@images/banner/banner-34.jpg'
import swiper35 from '@images/banner/banner-35.jpg'
import swiper36 from '@images/banner/banner-36.jpg'
import swiper37 from '@images/banner/banner-37.jpg'
import swiper38 from '@images/banner/banner-38.jpg'
import swiper39 from '@images/banner/banner-39.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    effect="coverflow"
    grab-cursor="true"
    centered-slides="true"
    slides-per-view="auto"
    coverflow-effect-rotate="50"
    coverflow-effect-stretch="0"
    coverflow-effect-depth="100"
    coverflow-effect-modifier="1"
    coverflow-effect-slide-shadows="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper31,
        swiper32,
        swiper33,
        swiper34,
        swiper35,
        swiper36,
        swiper37,
        swiper38,
        swiper39,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>

<style lang="scss" scoped>
swiper-slide {
  background-position: center;
  background-size: cover;
  block-size: 300px;
  inline-size: 300px;
}
</style>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper31 from '@images/banner/banner-31.jpg'
import swiper32 from '@images/banner/banner-32.jpg'
import swiper33 from '@images/banner/banner-33.jpg'
import swiper34 from '@images/banner/banner-34.jpg'
import swiper35 from '@images/banner/banner-35.jpg'
import swiper36 from '@images/banner/banner-36.jpg'
import swiper37 from '@images/banner/banner-37.jpg'
import swiper38 from '@images/banner/banner-38.jpg'
import swiper39 from '@images/banner/banner-39.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    effect="coverflow"
    grab-cursor="true"
    centered-slides="true"
    slides-per-view="auto"
    coverflow-effect-rotate="50"
    coverflow-effect-stretch="0"
    coverflow-effect-depth="100"
    coverflow-effect-modifier="1"
    coverflow-effect-slide-shadows="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper31,
        swiper32,
        swiper33,
        swiper34,
        swiper35,
        swiper36,
        swiper37,
        swiper38,
        swiper39,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>

<style lang="scss" scoped>
swiper-slide {
  background-position: center;
  background-size: cover;
  block-size: 300px;
  inline-size: 300px;
}
</style>
`},yr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper21 from '@images/banner/banner-21.jpg'
import swiper23 from '@images/banner/banner-23.jpg'
import swiper24 from '@images/banner/banner-24.jpg'
import swiper32 from '@images/banner/banner-32.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    centered-slides="true"
    effect="cube"
    grab-cursor="true"
    cube-effect-shadow="true"
    cube-effect-slide-shadows="true"
    cube-effect-shadow-scale="0.94"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper21,
        swiper32,
        swiper23,
        swiper24,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>

<style lang="scss" scoped>
swiper-slide {
  background-position: center;
  background-size: cover;
  block-size: 250px;
  inline-size: 250px;
}

swiper-container {
  margin: auto;
  block-size: 250px;
  inline-size: 250px;
}
</style>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper21 from '@images/banner/banner-21.jpg'
import swiper23 from '@images/banner/banner-23.jpg'
import swiper24 from '@images/banner/banner-24.jpg'
import swiper32 from '@images/banner/banner-32.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    centered-slides="true"
    effect="cube"
    grab-cursor="true"
    cube-effect-shadow="true"
    cube-effect-slide-shadows="true"
    cube-effect-shadow-scale="0.94"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper21,
        swiper32,
        swiper23,
        swiper24,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>

<style lang="scss" scoped>
swiper-slide {
  background-position: center;
  background-size: cover;
  block-size: 250px;
  inline-size: 250px;
}

swiper-container {
  margin: auto;
  block-size: 250px;
  inline-size: 250px;
}
</style>
`},kr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper16 from '@images/banner/banner-16.jpg'
import swiper17 from '@images/banner/banner-17.jpg'
import swiper18 from '@images/banner/banner-18.jpg'
import swiper19 from '@images/banner/banner-19.jpg'
import swiper20 from '@images/banner/banner-20.jpg'

register()
<\/script>

<template>
  <swiper-container
    space-between="30"
    pagination="true"
    navigation="true"
    effect="fade"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper20,
        swiper19,
        swiper18,
        swiper17,
        swiper16,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper16 from '@images/banner/banner-16.jpg'
import swiper17 from '@images/banner/banner-17.jpg'
import swiper18 from '@images/banner/banner-18.jpg'
import swiper19 from '@images/banner/banner-19.jpg'
import swiper20 from '@images/banner/banner-20.jpg'

register()
<\/script>

<template>
  <swiper-container
    space-between="30"
    pagination="true"
    navigation="true"
    effect="fade"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper20,
        swiper19,
        swiper18,
        swiper17,
        swiper16,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`},Sr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'

import swiper11 from '@images/banner/banner-11.jpg'
import swiper12 from '@images/banner/banner-12.jpg'
import swiper13 from '@images/banner/banner-13.jpg'
import swiper15 from '@images/banner/banner-15.jpg'
import swiper16 from '@images/banner/banner-16.jpg'

register()
<\/script>

<template>
  <swiper-container
    class="mySwiper"
    thumbs-swiper=".mySwiper2"
    loop="true"
    space-between="10"
    navigation="true"
    centered-slides="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper11,
        swiper12,
        swiper13,
        swiper15,
        swiper16,
        swiper11,
        swiper12,
        swiper13,

      ]"
      :key="swiperImg"
    >
      <VImg
        :src="swiperImg"
        cover
      />
    </swiper-slide>
  </swiper-container>

  <swiper-container
    class="mySwiper2"
    loop="true"
    free-mode="true"
    events-prefix="swiper-"
    slides-per-view="4"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper11,
        swiper12,
        swiper13,
        swiper15,
        swiper16,
        swiper11,
        swiper12,
        swiper13,
      ]"
      :key="swiperImg"
    >
      <VImg
        :src="swiperImg"
        cover
      />
    </swiper-slide>
  </swiper-container>
</template>

<style lang="scss" scoped>
swiper-container {
  background-color: #000;
}

.mySwiper2 {
  swiper-slide {
    border: 5px solid black;
    block-size: 100%;
    inline-size: 25%;
    opacity: 0.4;
  }

  .swiper-slide-thumb-active {
    opacity: 1;
  }
}
</style>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper11 from '@images/banner/banner-11.jpg'
import swiper12 from '@images/banner/banner-12.jpg'
import swiper13 from '@images/banner/banner-13.jpg'
import swiper15 from '@images/banner/banner-15.jpg'
import swiper16 from '@images/banner/banner-16.jpg'

register()
<\/script>

<template>
  <swiper-container
    class="mySwiper"
    thumbs-swiper=".mySwiper2"
    loop="true"
    space-between="10"
    navigation="true"
    centered-slides="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper11,
        swiper12,
        swiper13,
        swiper15,
        swiper16,
        swiper11,
        swiper12,
        swiper13,

      ]"
      :key="swiperImg"
    >
      <VImg
        :src="swiperImg"
        cover
      />
    </swiper-slide>
  </swiper-container>

  <swiper-container
    class="mySwiper2"
    loop="true"
    free-mode="true"
    events-prefix="swiper-"
    slides-per-view="4"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper11,
        swiper12,
        swiper13,
        swiper15,
        swiper16,
        swiper11,
        swiper12,
        swiper13,
      ]"
      :key="swiperImg"
    >
      <VImg
        :src="swiperImg"
        cover
      />
    </swiper-slide>
  </swiper-container>
</template>

<style lang="scss" scoped>
swiper-container {
  background-color: #000;
}

.mySwiper2 {
  swiper-slide {
    border: 5px solid black;
    block-size: 100%;
    inline-size: 25%;
    opacity: 0.4;
  }

  .swiper-slide-thumb-active {
    opacity: 1;
  }
}
</style>
`},Vr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper26 from '@images/banner/banner-26.jpg'
import swiper28 from '@images/banner/banner-28.jpg'
import swiper29 from '@images/banner/banner-29.jpg'
import swiper30 from '@images/banner/banner-30.jpg'
import swiper31 from '@images/banner/banner-31.jpg'
import swiper32 from '@images/banner/banner-32.jpg'
import swiper33 from '@images/banner/banner-33.jpg'
import swiper34 from '@images/banner/banner-34.jpg'
import swiper35 from '@images/banner/banner-35.jpg'
import swiper39 from '@images/banner/banner-39.jpg'

register()
<\/script>

<template>
  <swiper-container
    slides-per-view="4"
    grid-fill="rows"
    space-between="30"
    grid-rows="2"
    pagination-clickable="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper26,
        swiper39,
        swiper28,
        swiper29,
        swiper30,
        swiper31,
        swiper32,
        swiper33,
        swiper34,
        swiper35,
        swiper26,
        swiper39,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper26 from '@images/banner/banner-26.jpg'
import swiper28 from '@images/banner/banner-28.jpg'
import swiper29 from '@images/banner/banner-29.jpg'
import swiper30 from '@images/banner/banner-30.jpg'
import swiper31 from '@images/banner/banner-31.jpg'
import swiper32 from '@images/banner/banner-32.jpg'
import swiper33 from '@images/banner/banner-33.jpg'
import swiper34 from '@images/banner/banner-34.jpg'
import swiper35 from '@images/banner/banner-35.jpg'
import swiper39 from '@images/banner/banner-39.jpg'

register()
<\/script>

<template>
  <swiper-container
    slides-per-view="4"
    grid-fill="rows"
    space-between="30"
    grid-rows="2"
    pagination-clickable="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper26,
        swiper39,
        swiper28,
        swiper29,
        swiper30,
        swiper31,
        swiper32,
        swiper33,
        swiper34,
        swiper35,
        swiper26,
        swiper39,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`},Ir={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper20 from '@images/banner/banner-20.jpg'
import swiper4 from '@images/banner/banner-4.jpg'
import swiper5 from '@images/banner/banner-5.jpg'
import swiper7 from '@images/banner/banner-7.jpg'
import swiper8 from '@images/banner/banner-8.jpg'
import swiper9 from '@images/banner/banner-9.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination-clickable="true"
    autoplay="true"
    navigation="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper4,
        swiper5,
        swiper9,
        swiper7,
        swiper8,
        swiper20,
      ]"
      :key="swiperImg"
      lazy="true"
    >
      <VImg
        :src="swiperImg"
        cover
        loading="lazy"
      />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper20 from '@images/banner/banner-20.jpg'
import swiper4 from '@images/banner/banner-4.jpg'
import swiper5 from '@images/banner/banner-5.jpg'
import swiper7 from '@images/banner/banner-7.jpg'
import swiper8 from '@images/banner/banner-8.jpg'
import swiper9 from '@images/banner/banner-9.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination-clickable="true"
    autoplay="true"
    navigation="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper4,
        swiper5,
        swiper9,
        swiper7,
        swiper8,
        swiper20,
      ]"
      :key="swiperImg"
      lazy="true"
    >
      <VImg
        :src="swiperImg"
        cover
        loading="lazy"
      />
    </swiper-slide>
  </swiper-container>
</template>
`},hr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper31 from '@images/banner/banner-31.jpg'
import swiper32 from '@images/banner/banner-32.jpg'
import swiper33 from '@images/banner/banner-33.jpg'
import swiper34 from '@images/banner/banner-34.jpg'
import swiper35 from '@images/banner/banner-35.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    slides-per-view="3"
    space-between="25"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper31,
        swiper32,
        swiper33,
        swiper34,
        swiper35,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper31 from '@images/banner/banner-31.jpg'
import swiper32 from '@images/banner/banner-32.jpg'
import swiper33 from '@images/banner/banner-33.jpg'
import swiper34 from '@images/banner/banner-34.jpg'
import swiper35 from '@images/banner/banner-35.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    slides-per-view="3"
    space-between="25"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper31,
        swiper32,
        swiper33,
        swiper34,
        swiper35,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`},Br={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'

import swiper14 from '@images/banner/banner-14.jpg'
import swiper2 from '@images/banner/banner-2.jpg'
import swiper3 from '@images/banner/banner-3.jpg'
import swiper4 from '@images/banner/banner-4.jpg'
import swiper7 from '@images/banner/banner-7.jpg'

register()
<\/script>

<template>
  <swiper-container
    navigation="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper7,
        swiper4,
        swiper14,
        swiper3,
        swiper2,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper14 from '@images/banner/banner-14.jpg'
import swiper2 from '@images/banner/banner-2.jpg'
import swiper3 from '@images/banner/banner-3.jpg'
import swiper4 from '@images/banner/banner-4.jpg'
import swiper7 from '@images/banner/banner-7.jpg'

register()
<\/script>

<template>
  <swiper-container
    navigation="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper7,
        swiper4,
        swiper14,
        swiper3,
        swiper2,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`},Pr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper8 from '@images/banner/banner-8.jpg'
import swiper9 from '@images/banner/banner-9.jpg'

import swiper12 from '@images/banner/banner-12.jpg'
import swiper20 from '@images/banner/banner-20.jpg'
import swiper7 from '@images/banner/banner-7.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper12,
        swiper9,
        swiper8,
        swiper7,
        swiper20,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper8 from '@images/banner/banner-8.jpg'
import swiper9 from '@images/banner/banner-9.jpg'
import swiper12 from '@images/banner/banner-12.jpg'
import swiper20 from '@images/banner/banner-20.jpg'
import swiper7 from '@images/banner/banner-7.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination="true"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper12,
        swiper9,
        swiper8,
        swiper7,
        swiper20,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`},Cr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper5 from '@images/banner/banner-5.jpg'
import swiper8 from '@images/banner/banner-8.jpg'

import swiper20 from '@images/banner/banner-20.jpg'
import swiper4 from '@images/banner/banner-4.jpg'
import swiper7 from '@images/banner/banner-7.jpg'

register()
<\/script>

<template>
  <swiper-container
    navigation="true"
    pagination-type="progressbar"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper8,
        swiper7,
        swiper20,
        swiper4,
        swiper5,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper5 from '@images/banner/banner-5.jpg'
import swiper8 from '@images/banner/banner-8.jpg'
import swiper20 from '@images/banner/banner-20.jpg'
import swiper4 from '@images/banner/banner-4.jpg'
import swiper7 from '@images/banner/banner-7.jpg'

register()
<\/script>

<template>
  <swiper-container
    navigation="true"
    pagination-type="progressbar"
    events-prefix="swiper-"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper8,
        swiper7,
        swiper20,
        swiper4,
        swiper5,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`},$r={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import swiper31 from '@images/banner/banner-31.jpg'
import swiper32 from '@images/banner/banner-32.jpg'
import swiper33 from '@images/banner/banner-33.jpg'
import swiper34 from '@images/banner/banner-34.jpg'
import swiper35 from '@images/banner/banner-35.jpg'
import swiper36 from '@images/banner/banner-36.jpg'
import swiper37 from '@images/banner/banner-37.jpg'
import swiper38 from '@images/banner/banner-38.jpg'
import swiper39 from '@images/banner/banner-39.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination-clickable="true"
    slides-per-view="5"
    space-between="50"
    events-prefix="swiper-"
    :breakpoints="{
      1024: {
        slidesPerView: 4,
        spaceBetween: 40,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    }"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper31,
        swiper32,
        swiper33,
        swiper34,
        swiper35,
        swiper36,
        swiper37,
        swiper38,
        swiper39,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'
import swiper31 from '@images/banner/banner-31.jpg'
import swiper32 from '@images/banner/banner-32.jpg'
import swiper33 from '@images/banner/banner-33.jpg'
import swiper34 from '@images/banner/banner-34.jpg'
import swiper35 from '@images/banner/banner-35.jpg'
import swiper36 from '@images/banner/banner-36.jpg'
import swiper37 from '@images/banner/banner-37.jpg'
import swiper38 from '@images/banner/banner-38.jpg'
import swiper39 from '@images/banner/banner-39.jpg'

register()
<\/script>

<template>
  <swiper-container
    pagination-clickable="true"
    slides-per-view="5"
    space-between="50"
    events-prefix="swiper-"
    :breakpoints="{
      1024: {
        slidesPerView: 4,
        spaceBetween: 40,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    }"
  >
    <swiper-slide
      v-for="swiperImg in [
        swiper31,
        swiper32,
        swiper33,
        swiper34,
        swiper35,
        swiper36,
        swiper37,
        swiper38,
        swiper39,
      ]"
      :key="swiperImg"
    >
      <VImg :src="swiperImg" />
    </swiper-slide>
  </swiper-container>
</template>
`},zr={ts:`<script setup lang="ts">
import { register } from 'swiper/element/bundle'

register()

const slides = Array.from({ length: 500 }, (_, index) => \`Slides \${index + 1}\`)
const swiperEl = ref<any>(null)
const prependNumber = ref(1)
const appendNumber = ref(500)

const toSlide = (index: number) => {
  swiperEl.value?.swiper.slideTo(index - 1)
}

const prependSlide = () => {
  swiperEl.value?.swiper.prependSlide([
    \`<swiper-slide>Slide \${(--prependNumber.value)} </swiper-slide>\`,
    \`<swiper-slide>Slide \${(--prependNumber.value)} </swiper-slide>\`,
  ])
}

const appendSlide = () => {
  swiperEl.value?.swiper.appendSlide([
    \`<swiper-slide>Slide \${(++appendNumber.value)} </swiper-slide>\`,
  ])
}
<\/script>

<template>
  <section class="swiper-virtual">
    <swiper-container
      ref="swiperEl"
      virtual="true"
      :slides="slides"
      navigation="true"
      slides-per-view="5"
      space-between="50"
      free-mode="true"
      events-prefix="swiper-"
      :breakpoints="{
        1024: {
          slidesPerView: 4,
          spaceBetween: 40,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
      }"
    >
      <swiper-slide
        v-for="(item, index) in slides"
        :key="index"
      >
        <div class="text-secondary">
          {{ item }}
        </div>
      </swiper-slide>
    </swiper-container>

    <div class="d-flex justify-center gap-4 flex-wrap">
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="prependSlide"
      >
        Prepend 2 Slides
      </VBtn>
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="toSlide(1)"
      >
        Slide 1
      </VBtn>
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="toSlide(250)"
      >
        Slide 250
      </VBtn>
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="toSlide(500)"
      >
        Slide 500
      </VBtn>
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="appendSlide"
      >
        Append Slide
      </VBtn>
    </div>
  </section>
</template>

<style lang="scss">
.swiper-virtual {
  swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eee;
    font-size: 18px;
    text-align: center;
  }

  swiper-container {
    block-size: 300px;
    inline-size: 100%;
    margin-block: 20px;
    margin-inline: auto;
  }
}
</style>
`,js:`<script setup>
import { register } from 'swiper/element/bundle'

register()

const slides = Array.from({ length: 500 }, (_, index) => \`Slides \${ index + 1 }\`)
const swiperEl = ref(null)
const prependNumber = ref(1)
const appendNumber = ref(500)

const toSlide = index => {
  swiperEl.value?.swiper.slideTo(index - 1)
}

const prependSlide = () => {
  swiperEl.value?.swiper.prependSlide([
    \`<swiper-slide>Slide \${ --prependNumber.value } </swiper-slide>\`,
    \`<swiper-slide>Slide \${ --prependNumber.value } </swiper-slide>\`,
  ])
}

const appendSlide = () => {
  swiperEl.value?.swiper.appendSlide([\`<swiper-slide>Slide \${ ++appendNumber.value } </swiper-slide>\`])
}
<\/script>

<template>
  <section class="swiper-virtual">
    <swiper-container
      ref="swiperEl"
      virtual="true"
      :slides="slides"
      navigation="true"
      slides-per-view="5"
      space-between="50"
      free-mode="true"
      events-prefix="swiper-"
      :breakpoints="{
        1024: {
          slidesPerView: 4,
          spaceBetween: 40,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
      }"
    >
      <swiper-slide
        v-for="(item, index) in slides"
        :key="index"
      >
        <div class="text-secondary">
          {{ item }}
        </div>
      </swiper-slide>
    </swiper-container>

    <div class="d-flex justify-center gap-4 flex-wrap">
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="prependSlide"
      >
        Prepend 2 Slides
      </VBtn>
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="toSlide(1)"
      >
        Slide 1
      </VBtn>
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="toSlide(250)"
      >
        Slide 250
      </VBtn>
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="toSlide(500)"
      >
        Slide 500
      </VBtn>
      <VBtn
        variant="outlined"
        color="primary"
        @click.prevent="appendSlide"
      >
        Append Slide
      </VBtn>
    </div>
  </section>
</template>

<style lang="scss">
.swiper-virtual {
  swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eee;
    font-size: 18px;
    text-align: center;
  }

  swiper-container {
    block-size: 300px;
    inline-size: 100%;
    margin-block: 20px;
    margin-inline: auto;
  }
}
</style>
`},Wr=m({__name:"swiper",setup(c){return(o,a)=>{const i=ur,p=we,j=dr,U=lr,T=ar,v=tr,u=sr,_=Xe,L=Re,re=Oe,ie=Ne,se=Ce,ne=he,te=Se,pe=xe,ae=ve,oe=ue;return s(),le(me,null,{default:t(()=>[r(d,null,{default:t(()=>[r(p,{title:"Basic",code:vr},{default:t(()=>[r(i)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Navigation",code:Br},{default:t(()=>[r(j)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Pagination",code:Pr},{default:t(()=>[r(U)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Progress",code:Cr},{default:t(()=>[r(T)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Multiple Slides Per View",code:hr},{default:t(()=>[r(v)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Grid",code:Vr},{default:t(()=>[r(u)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{variant:"text",title:"Centered Slides Option 1",code:_r},{default:t(()=>[r(_)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Centered Slides Option 2",code:xr},{default:t(()=>[r(L)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Fade",code:kr},{default:t(()=>[r(re)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Cube Effect",code:yr},{default:t(()=>[r(ie)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Coverflow Effect",code:jr},{default:t(()=>[r(se)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Autoplay",code:fr},{default:t(()=>[r(ne)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Gallery",code:Sr},{default:t(()=>[r(te)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Lazy Loading",code:Ir},{default:t(()=>[r(pe)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Responsive Breakpoints",code:$r},{default:t(()=>[r(ae)]),_:1},8,["code"])]),_:1}),r(d,null,{default:t(()=>[r(p,{title:"Virtual Slides",code:zr},{default:t(()=>[r(oe)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{Wr as default};
