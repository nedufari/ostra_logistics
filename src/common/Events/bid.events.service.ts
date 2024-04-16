// bid.events.service.ts

import { Injectable,  } from '@nestjs/common';
import {EventEmitter} from 'events';
import { BidEvent } from 'src/Enums/all-enums';

@Injectable()
export class BidEventsService {
  private readonly emitter = new EventEmitter();

  emitBidEvent(event: BidEvent, data: any) {
    this.emitter.emit(event, data);
  }

  onBidEvent(event: BidEvent, listener: (...args: any[]) => void) {
    this.emitter.addListener(event, listener);
  }
}
