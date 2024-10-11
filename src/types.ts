import { HistoryEvent } from "@aws-sdk/client-sfn";

export interface HistoryEventWithNext extends HistoryEvent {
  nextEventIds?: number[];
  mapIterationIndex?: number;
  historyIndex?: number;
  originalEventJson?: string;
}
