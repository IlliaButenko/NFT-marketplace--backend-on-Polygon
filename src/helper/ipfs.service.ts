import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const URL = `https://api.pinata.cloud`;

@Injectable()
export class IpfsService {
  private axiosPinata;

  constructor(private config: ConfigService) {
    const headers = {
      pinata_api_key: this.config.get('PINATA_API_KEY'),
      pinata_secret_api_key: this.config.get('PINATA_SECRET_KEY'),
    };
    this.axiosPinata = axios.create({
      baseURL: URL,
      headers: headers,
    });
  }

  async fetchUri(uri: string) {
    try {
      const hash = uri.split('/').pop();
      const GATE_WAY =
        this.config.get('IPFS_GATE_WAY') || 'https://ipfs.io/ipfs/';
      const { data } = await axios.get(`${GATE_WAY}/${hash}`);
      return {
        name: data?.name || data?.title,
        description: data?.description,
        image: data?.image,
        fileType: data?.type || 'image',
        originType: data?.originType,
        media: data?.media,
      };
    } catch (error) {
      return {};
    }
  }

  async jsonToUri(data: any) {
    const url = `/pinning/pinJSONToIPFS`;
    const GATE_WAY =
      this.config.get('IPFS_GATE_WAY') || 'https://ipfs.io/ipfs/';

    const res = await this.axiosPinata.post(url, data);
    return `${GATE_WAY}/${res.data.IpfsHash}`;
  }
}
