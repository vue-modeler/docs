---
layout: home

hero:
  name: "Vue Modeler"
  text: "State management without the pain"
  tagline: "Built on OOP. Less code. More control — no store."
  image:
    src: /logo.webp
  actions:
    - theme: brand
      text: Getting Started
      link: /introduction/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/vue-modeler
    - theme: sponsor
      text: Donate
      link: https://www.donationalerts.com/r/avbratko
      target: _blank
      rel: noopener noreferrer

features:
  - icon: 📦
    title: Model instead of store
    details: No store — no problem. State is encapsulated in the model. The model is a shallowReactive object. Destroying the model destroys the state.
  - icon: ⚡
    title: Action is an object
    details: Has its own state and behavior for execution control. Created automatically from a model method.
  - icon: 🏛️
    title: OOP
    details: Model is defined via a standard class, actions via methods. Inheritance, encapsulation, polymorphism, destructor are available by default.
  - icon: 🏗️
    title: Model and dependency container
    details: No need to think about how to create, get, or remove a model after use — the container handles it.
  - icon: ✂️
    title: Less code
    details: Action has methods for execution control and error handling. You will write less boilerplate.
  - icon: 🧪
    title: Easy testing
    details: Less code — fewer tests.
  - icon: 🗜️
    title: Minimal size
    details: Compact library with minimal bundle size.
  - icon: 🔒
    title: Type safety
    details: All autocomplete hints work both inside and outside the class context.
---
