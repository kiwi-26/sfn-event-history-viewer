<script setup lang="ts">
import { computed, ref, Ref } from 'vue'
import { HistoryEventWithNext } from './types.ts';
import EventListItem from './components/EventListItem.vue';

const input = ref('')
const events: Ref<HistoryEventWithNext[]> = ref([])
const eventMap: Ref<Map<number, HistoryEventWithNext>> = ref(new Map());
const mapIterationIndexMax = ref(-1);
const filteredIterationIndex = ref(-1);

const loadInput = () => {
  const json = JSON.parse(input.value) as HistoryEventWithNext[];
  const tmpEvents: HistoryEventWithNext[] = [];
  const tmpEventMap = new Map<number, HistoryEventWithNext>();
  for (let i = 0; i < json.length; i++) {
    const event = json[i];
    event.historyIndex = i;
    if (event.id) {
      event.nextEventIds = [];
      switch (event.type) {
        case 'MapIterationStarted':
          event.mapIterationIndex = event.mapIterationStartedEventDetails?.index;
          break;
        case 'MapIterationSucceeded':
          event.mapIterationIndex = event.mapIterationSucceededEventDetails?.index;
          break;
        case 'MapIterationAborted':
          event.mapIterationIndex = event.mapIterationAbortedEventDetails?.index;
          break;
        case 'MapIterationFailed':
          event.mapIterationIndex = event.mapIterationFailedEventDetails?.index;
          break;
      }
      if (event.mapIterationIndex == null) {
        event.mapIterationIndex = -1
      }

      if (mapIterationIndexMax.value < event.mapIterationIndex) {
        mapIterationIndexMax.value = event.mapIterationIndex
      }

      if (event.previousEventId) {
        const previousEvent = tmpEventMap.get(event.previousEventId)
        if (previousEvent) {
          previousEvent.nextEventIds?.push(event.id)
          if (event.mapIterationIndex == -1 && event.type !== 'MapStateFailed' && event.type !== 'MapStateSucceeded') {
            if (event.mapIterationIndex !== previousEvent.mapIterationIndex) {
              event.mapIterationIndex = previousEvent.mapIterationIndex
            }
          }
        }
      }
      tmpEventMap.set(event.id, event);
      tmpEvents.push(event)
    }
  }

  events.value = tmpEvents;
  eventMap.value = tmpEventMap;
}

const filteredEvents = computed(() => {
  if (filteredIterationIndex.value == -1) {
    return events.value;
  }
  return events.value.filter(event => {
    return event.mapIterationIndex == filteredIterationIndex.value || event.mapIterationIndex == -1
  })
})
</script>

<template>
  <div class="container space-y-4 p-4 mx-auto">
    <h1 class="text-xl font-bold text-sky-800">Step Functions execution history events viewer</h1>
    <h2 class="font-bold text-sky-800">Input events (JSON)</h2>
    <div class="space-y-2">
      <textarea v-model="input" class="w-full border rounded-lg h-16 p-4" placeholder="[{…},{…},…]"></textarea>
      <button type="button" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow" @click="loadInput">Apply</button>
    </div>

    <h2 class="font-bold text-sky-800">Result</h2>
    <div v-if="mapIterationIndexMax > 0" class="space-y-1">
      <label for="filteredIterationIndex" class="block text-sm">Map iteration index</label>
      <select id="filteredIterationIndex" v-model="filteredIterationIndex" class="px-4 py-2 border rounded-lg cursor-pointer">
        <option v-for="idx of [...Array(mapIterationIndexMax + 2)].map((_, i) => i - 1)" :key="idx" :value="idx">{{ idx ==
          -1 ? 'all' : idx }}</option>
      </select>
    </div>
    
    <div class="space-y-1 relative">
      <div class="grid grid-cols-8 gap-2 sticky top-0 bg-white text-sm">
        <p class="col-span-1 p-2 border-b">id</p>
        <p class="col-span-2 p-2 border-b">type</p>
        <p class="col-span-4 p-2 border-b">name</p>
        <p class="col-span-1 p-2 border-b">itr</p>
      </div>
      <event-list-item v-for="event of filteredEvents" :key="event.id" :event="event" />
    </div>
    
    <h2 class="font-bold text-sky-800">Input (indented)</h2>
    <div class="border rounded-lg p-4">
      <code class="text-xs"><pre style="white-space: pre-wrap;">{{ input.length > 0 ? JSON.parse(input) : '' }}</pre></code>
    </div>
  </div>
</template>