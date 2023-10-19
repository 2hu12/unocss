export const panelEl = ref()
const TITLE_HEIGHT = 29
const { height: vh } = useElementSize(panelEl)
const collapsedPanelSet = ref(new Set())
const collapsedPanels = collapsedPanelSet.value

export const titleHeightPercent = computed(() => {
  if (!vh.value)
    return 0
  return TITLE_HEIGHT / vh.value * 100
})

export const panelSizes = useLocalStorage<number[]>(
  'unocss-panel-sizes',
  getInitialPanelSizes(titleHeightPercent.value),
  { listenToStorageChanges: false },
)

export function getInitialPanelSizes(percent: number): number[] {
  return [
    100 - percent * 3,
    percent,
    percent,
    percent,
  ]
}

export function isCollapsed(idx: number) {
  return collapsedPanels.has(idx)
}

export function togglePanel(idx: number) {
  if (collapsedPanels.has(idx)) {
    collapsedPanels.delete(idx)
  }
  else {
    collapsedPanels.add(idx)
    if (collapsedPanels.size === panelSizes.value.length)
      collapsedPanels.delete((idx + 1) % panelSizes.value.length)
  }

  normalizePanels()
}

export function normalizePanels() {
  const height = (100 - collapsedPanels.size * titleHeightPercent.value) / (panelSizes.value.length - collapsedPanels.size)

  panelSizes.value.forEach((v, idx) => {
    panelSizes.value[idx] = collapsedPanels.has(idx) ? titleHeightPercent.value : height
  })
}

watch(
  panelSizes,
  (value: number[]) => {
    value.forEach((height, idx) => {
      if (height > titleHeightPercent.value)
        collapsedPanels.delete(idx)
      else
        collapsedPanels.add(idx)
    })
  },
)

watch(
  titleHeightPercent,
  (value: number) => {
    if (panelSizes.value.includes(100)) {
      panelSizes.value = getInitialPanelSizes(value)
      return
    }

    panelSizes.value = panelSizes.value.map((percent, idx) => collapsedPanels.has(idx) ? titleHeightPercent.value : Math.max(titleHeightPercent.value, percent))
  },
)
