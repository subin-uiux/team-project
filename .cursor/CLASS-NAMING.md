# EQUIL Section Block Names

페이지별 고정 section Block 목록입니다. 기존 이름을 임의로 변경하거나 새 Block을 만들지 말고, 아래 이름을 사용합니다.

## 공통 UI 패턴 (재사용)

섹션 Block이 아닌 공통 패턴. 팀 용어·상세 스펙은 `.cursor/rules/ui-patterns.mdc` 참고.

| 용어 | 클래스 / 패턴 |
|------|----------------|
| **3단 타이틀** | `heading-3tier`, `heading-3tier__sub-title`, `heading-3tier__title`, `heading-3tier__desc` |
| **fadeUp** | GSAP 글자 단위 등장 애니메이션 — `(section-block)__char` |
| **제품 비교** | `product-compare` — 3열 제품 카드 비교 섹션 레이아웃 |
| **섹션 CTA** | `section-cta` — 하단 CTA 배너 레이아웃 |

## index.html

```
index.html
├ main-hero
├ main-problem (+ main-problem-nav)
├ main-mattress-solution
├ main-heating-solution
├ main-pillow-solution
├ main-bedding-overview
├ main-bedding-solution
├ main-sleep-fit
└ main-review
```

## brand-story.html

```
brand-story.html
├ brand-story-hero
├ brand-story-name
├ brand-story-origin
├ brand-story-philosophy
└ brand-story-end
```

## mattress-tech.html

```
mattress-tech.html
├ mattress-tech-hero
├ mattress-tech-overview
├ mattress-tech-research
├ mattress-tech-structure-overview
├ mattress-tech-top-layer
├ mattress-tech-support-layers
├ mattress-tech-pressure
├ mattress-tech-process
└ mattress-tech-cta
```

## pillow-tech.html

```
pillow-tech.html
├ pillow-tech-hero
├ pillow-tech-sleep-position
├ pillow-tech-structure
├ pillow-tech-zones
├ pillow-tech-products
└ pillow-tech-cta
``` 

## bedding-tech.html

```
bedding-tech.html
├ bedding-tech-hero
├ bedding-tech-design
├ bedding-tech-process
├ bedding-tech-wool
├ bedding-tech-seasonal
├ bedding-tech-products
└ bedding-tech-cta
```

## heating-mat-tech.html

```
heating-mat-tech.html
├ heating-mat-tech-hero
├ heating-mat-tech-problem
├ heating-mat-tech-product-overview
├ heating-mat-tech-product
├ heating-mat-tech-technology
├ heating-mat-tech-certification
├ heating-mat-tech-controller
├ heating-mat-tech-danger
└ heating-mat-tech-cta
```

## product.html

```
product.html
├ product-hero
└ product-list
```

## news.html

```
news.html
├ news-hero
└ news-list
```

## events.html

```
events.html
├ events-hero
└ events-list
```

## store.html

```
store.html
├ store-hero
└ store-map
```

## sleep-fit-test.html

```
sleep-fit-test.html
├ sleep-fit-test
├ sleep-fit-result
├ sleep-fit-structure
└ sleep-fit-cta
```
