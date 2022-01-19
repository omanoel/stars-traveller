# Stars traveller v2.3.0

## Goal

The goal of this web application is to simulate a traveller in a space ship, which wants to navigate between stars. It's in 3D view, and the stars are extracted from the HYG catalog (among 110 000 stars).

## Technologies

- Angular v13
- Three.js
- Typescript

## Roadmap

### Chart

Add a chart panel in order to display a scatter chart.
By default, the cart displays 'absmag' in function of 'mag'.

List of available properties

- mag
- absmag
- dec
- ra
- dist

Property on X axis can be updated.
Property on Y axis can be updated.

Zoom is available on both axis.

Range on X scale can be used as a filter.
Range on Y scale can be used as a filter.
Range on X/Y scales can be used as a filter.

### HYGMap website

This site has another representation of stars provided by HYG catalog. A link is created, close to property id.
