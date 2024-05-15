import { Injectable } from '@nestjs/common';
// import { KrakenGateway } from './gateway/kraken.gateway';
import { WebSocketService } from './Websocket.service';
import axios from 'axios';
@Injectable()
export class AppService {
  constructor(private readonly webSocketService: WebSocketService) {}
  private readonly krakenApiUrl = 'https://api.kraken.com/0/public';

  async getOrderBook(pair: string, count: number = 3): Promise<any> {
    try {
      const response = await axios.get(`${this.krakenApiUrl}/Depth`, {
        params: {
          pair,
          count,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch order book for ${pair}: ${error.message}`,
      );
    }
  }

  calculatePerMinute = (data: any[], count: number) => {
    const timestamps = data.map((item) => item[2]);
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);
    const timeDuration = (maxTimestamp - minTimestamp) / (count - 1);
    const perMinute = timeDuration !== 0 ? (count / timeDuration) * 60 : 0;
    return perMinute;
  };

  async makeResponseData(pair: string, name: string): Promise<string> {
    if (!pair || typeof pair !== 'string') {
      throw new Error('Invalid or missing pair parameter');
    }
    const typeArray = pair.split(',');
    const nameArray = name.split(',');
    const resultData: any[] = [];

    for (let i = 0; i < typeArray.length; i++) {
      try {
        const count = 101;
        const orderBook = await this.getOrderBook(typeArray[i], count); //get maximum number of asks/bids
        const { bids, asks } = orderBook.result[nameArray[i]];
        const bidsPerMin = this.calculatePerMinute(bids, count);
        const asksPerMin = this.calculatePerMinute(asks, count);

        const bestBid = parseFloat(bids[0][0]);
        const bestAsk = parseFloat(asks[0][0]);
        const spread = bestAsk - bestBid;
        const midPrice = (bestBid + bestAsk) / 2;
        const spredPercentage = (spread / midPrice) * 100;
        const tempData = {
          name: typeArray[i],
          bids: bids.slice(0, 3),
          asks: asks.slice(0, 3).reverse(),
          spread,
          midPrice,
          spredPercentage,
          opm: bidsPerMin + asksPerMin,
        };
        resultData.push(tempData);
      } catch (error) {
        console.error(
          `Error fetching data for ${typeArray[i]}: ${error.message}`,
        );
      }
    }
    return JSON.stringify(resultData);
  }
  async emitKrakenData(data: string, name: string) {
    this.webSocketService.broadcastMessage(
      await this.makeResponseData(data, name),
    );
  }
}
