import { Injectable } from '@nestjs/common';
// import { KrakenGateway } from './gateway/kraken.gateway';
import { WebSocketService } from './Websocket.service';
import axios from 'axios'
@Injectable()
export class AppService {
  constructor(private readonly webSocketService: WebSocketService) { }
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
      throw new Error(`Failed to fetch order book for ${pair}: ${error.message}`);
    }
  }

  async makeResponseData(pair: string, name: string): Promise<string> {
    if (!pair || typeof pair !== 'string') {
      throw new Error('Invalid or missing pair parameter');
    }
    const typeArray = pair.split(',');
    const nameArray = name.split(',');
    const resultData: any[] = [];
    for (let i = 0; i < typeArray.length; i++) {
      try {
        const orderBook = await this.getOrderBook(typeArray[i]);
        const { bids, asks } = orderBook.result[nameArray[i]];
        const bestBid = parseFloat(bids[0][0]);
        const bestAsk = parseFloat(asks[0][0]);
        const spread = bestAsk - bestBid;
        const midPrice = (bestBid + bestAsk) / 2;
        const spredPercentage = (spread / midPrice) * 100;
        const tempData = {
          name: typeArray[i],
          bids: bids,
          asks: asks.reverse(),
          spread: spread,
          midPrice: midPrice,
          spredPercentage: spredPercentage
        }
        resultData.push(tempData);
      } catch (error) {
        console.error(`Error fetching data for ${typeArray[i]}: ${error.message}`);
      }
    }
    return JSON.stringify(resultData);
  }
  async emitKrakenData(data: string, name: string) {
    this.webSocketService.broadcastMessage(await this.makeResponseData(data, name));
  }

}
