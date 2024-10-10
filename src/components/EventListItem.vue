<script setup lang="ts">
import { VNode, h, ref } from 'vue';
import { HistoryEventWithNext } from '../types';
import { ChevronUpIcon, ChevronDownIcon, EllipsisHorizontalCircleIcon, MinusCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { HistoryEventType } from '@aws-sdk/client-sfn';

defineProps<{
  event: HistoryEventWithNext
}>()
const isExpanded = ref(false);

const getEventName = (event: HistoryEventWithNext) => {
  switch (event.type) {
    case 'MapStateEntered':
    case 'TaskStateEntered':
    case 'ChoiceStateEntered':
    case 'PassStateEntered':
      return event.stateEnteredEventDetails?.name;
    case 'MapIterationStarted':
      return event.mapIterationStartedEventDetails?.name
    case 'MapIterationSucceeded':
      return event.mapIterationSucceededEventDetails?.name
    case 'MapIterationFailed':
      return event.mapIterationFailedEventDetails?.name
    case 'TaskStateExited':
    case 'ChoiceStateExited':
    case 'PassStateExited':
      return event.stateExitedEventDetails?.name;
    default:
      return null;
  }
}

const getEventIcon = (eventType: HistoryEventType | undefined): VNode => {
  if (!eventType) {
    return h(EllipsisHorizontalCircleIcon);
  }

  if (eventType.endsWith('Succeeded')) {
    return h(CheckCircleIcon);
  }
  if (eventType.endsWith('Failed')) {
    return h(XCircleIcon);
  }
  if (eventType.endsWith('Aborted')) {
    return h(MinusCircleIcon);
  }
  return h(EllipsisHorizontalCircleIcon);
}

const getEventTypeClass = (eventType: HistoryEventType | undefined): any => {
  if (!eventType) {
    return { 'text-gray-500': true };
  }

  if (eventType.endsWith('Succeeded')) {
    return { 'text-green-600': true };
  }
  if (eventType.endsWith('Failed')) {
    return { 'text-red-500': true };
  }
  if (eventType.endsWith('Aborted')) {
    return { 'text-gray-800': true };
  }
  return { 'text-gray-500': true };
}

const getEventDetail = (event: HistoryEventWithNext) => {
  switch (event.type) {
    case 'ExecutionStarted':
      return [
        ['input', JSON.parse(event.executionStartedEventDetails?.input ?? '{}')]
      ];
    case 'MapStateEntered':
    case 'TaskStateEntered':
    case 'ChoiceStateEntered':
    case 'PassStateEntered':
      return [
        ['input', JSON.parse(event.stateEnteredEventDetails?.input ?? '{}')]
      ];
    case 'MapIterationStarted':
      return [
        ['index', event.mapIterationStartedEventDetails?.index]
      ]
    case 'MapIterationSucceeded':
      return [
        ['index', event.mapIterationSucceededEventDetails?.index]
      ]
    case 'MapIterationFailed':
      return [
        ['index', event.mapIterationFailedEventDetails?.index]
      ]
    case 'TaskScheduled':
      return [
        ['resourceType', event.taskScheduledEventDetails?.resourceType],
        ['resource', event.taskScheduledEventDetails?.resource],
        ['parameters', event.taskScheduledEventDetails?.parameters ? JSON.parse(event.taskScheduledEventDetails?.parameters) : '-'],
      ]
    case 'TaskStarted':
      return [
        ['resourceType', event.taskStartedEventDetails?.resourceType],
        ['resource', event.taskStartedEventDetails?.resource],
      ]
    case 'MapStateStarted':
      return [
        ['length', event.mapStateStartedEventDetails?.length],
      ]
    case 'TaskSucceeded':
      return [
        ['resourceType', event.taskSucceededEventDetails?.resourceType],
        ['resource', event.taskSucceededEventDetails?.resource],
        ['output', event.taskSucceededEventDetails?.output ? JSON.parse(event.taskSucceededEventDetails?.output) : '-'],
      ]
    case 'TaskStateExited':
    case 'ChoiceStateExited':
    case 'PassStateExited':
    case 'MapStateExited':
      return [
        ['output', event.stateExitedEventDetails?.output ? JSON.parse(event.stateExitedEventDetails?.output) : '-'],
      ]
    case 'ExecutionSucceeded':
      return [
        ['output', event.executionSucceededEventDetails?.output],
      ]
    case 'ExecutionFailed':
      return [
        ['error', event.executionFailedEventDetails?.error],
        ['cause', event.executionFailedEventDetails?.cause],
      ]
    default:
      return []
  }
}

const shouldExpand = (event: HistoryEventWithNext) => getEventDetail(event).length > 0
</script>

<template>
  <div class="border rounded-sm text-sm">
    <label class="grid grid-cols-12 gap-1" :class="{'cursor-pointer hover:bg-gray-50': shouldExpand(event)}">
      <p class="col-span-1 p-2">
        <input type="checkbox" v-model="isExpanded" class="hidden" />
        {{ event.historyIndex }}
      </p>
      <p class="col-span-1 p-2">
        {{ event.id }}
      </p>
      <p class="col-span-4 p-2 flex items-center gap-1" :class="getEventTypeClass(event.type)">
        <component :is="getEventIcon(event.type)" class="h-4 w-4"/>
        {{ event.type }}
      </p>
      <p class="col-span-5 p-2">{{ getEventName(event) }}</p>
      <div class="col-span-1 p-2 flex justify-between items-center">
        <span :class="{'text-gray-300': (event.mapIterationIndex ?? -1) < 0}">{{ (event.mapIterationIndex ?? -1) < 0 ? '-' : event.mapIterationIndex }}</span>
        <ChevronDownIcon v-if="shouldExpand(event) && !isExpanded" class="w-4 h-4" />
        <ChevronUpIcon v-if="shouldExpand(event) && isExpanded" class="w-4 h-4" />
      </div>
    </label>
    <div class="p-2" v-if="isExpanded && shouldExpand(event)">
      <table class="w-full bg-sky-50 rounded-sm">
        <tr v-for="detail of getEventDetail(event)" :key="detail[0]">
          <th class="p-2 align-top text-left w-16">{{ detail[0] }}</th>
          <td class="p-2">
            <pre class="whitespace-pre-wrap">{{ detail[1] }}</pre>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

