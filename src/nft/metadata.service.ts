import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { IpfsService } from 'src/helper/ipfs.service';
import { Metadata } from './schemas/meta.schema';
import { MetaStatusEnum } from './interfaces/metaStatus.enum';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger('MetadataService');

  constructor(
    @InjectModel(Metadata)
    private readonly metadataModel: ReturnModelType<typeof Metadata>,
    private readonly ipfsService: IpfsService,
    private configService: ConfigService,
  ) {}

  async getRandomMetadata(limit: number) {
    const metas = await this.metadataModel
      .find({ status: MetaStatusEnum.READY })
      .limit(limit)
      .exec();

    const uris = await Promise.all(
      metas.map(async (metadata) => {
        const uri = await this.uploadToIpfs(metadata);
        metadata.uri = uri;
        metadata.status = MetaStatusEnum.PENDING;
        await metadata.save();
        return uri;
      }),
    );
    return {
      uris,
      hashs: metas.map((metadata) => metadata.hash),
    };
  }

  async makeMinted(uri: string) {
    const meta = await this.metadataModel.findOne({ uri }).exec();
    if (meta) {
      meta.status = MetaStatusEnum.MINTED;
      meta.save();
    }
  }

  @Interval(10000)
  async makeExpiredReady() {
    const fiveMinutesAgo = Date.now() - 10 * 60 * 1000;
    const expiredMetas = await this.metadataModel
      .find({
        status: MetaStatusEnum.PENDING,
        timestampUpdate: { $lt: fiveMinutesAgo },
      })
      .exec();

    // change status to ready
    expiredMetas.forEach((meta) => {
      meta.status = MetaStatusEnum.READY;
      meta.save();
      this.logger.verbose('Revert: ' + meta.hash);
    });
  }

  private uploadToIpfs(metadata: Metadata) {
    const metaObject = {
      name: 'Corgi ',
      description: 'Corgi is a dog',
      image: this.getImageUrl(metadata),
      attributes: metadata.attributes,
    };
    return this.ipfsService.jsonToUri(metaObject);
  }

  private getImageUrl(metadata: Metadata) {
    const IPFS_IMAGE_FOLDER = this.configService.get('IPFS_IMAGE_FOLDER');
    const GATE_WAY =
      this.configService.get('IPFS_GATE_WAY') || 'https://ipfs.io/ipfs/';
    const hashFolder = metadata.ipfsFolderHash || IPFS_IMAGE_FOLDER;
    return `${GATE_WAY}/${hashFolder}/${metadata.hash}.png`;
  }
}
