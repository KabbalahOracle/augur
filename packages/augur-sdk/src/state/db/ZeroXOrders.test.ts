import { ZeroXOrders } from "./ZeroXOrders";

describe("ZeroX :: Orders ::", () => {
  test('ParseAssetData :: Market Id Needs Padding', async () => {
    const assetData = "0x94cfcdd7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000124a7cb5fb7000000000000000000000000f6e791393480ed275cb1729b99c7806ebfc194c0000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000100a8877dadfd7bd46c8462301ecfc989327aef31000000000000000000320200000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024f47261b000000000000000000000000086309723166c177591960e5a9a5ecb70565643310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e4a7cb5fb70000000000000000000000003ce63181dc7923811fcb51e00fd946ca69e19164000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const parsedAssetData = ZeroXOrders.parseAssetData(assetData);
    expect(parsedAssetData.market).toEqual('0x00A8877DaDFD7Bd46C8462301EcFC989327Aef31');
    expect(parsedAssetData.price).toEqual('0x00');
    expect(parsedAssetData.outcome).toEqual('0x01');
  });

  test('ParseAssetData :: Market Id Higher Order Bits Full ', async () => {
    const assetData = "0x94cfcdd7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000124a7cb5fb7000000000000000000000000f6e791393480ed275cb1729b99c7806ebfc194c0000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000111a8877dadfd7bd46c8462301ecfc989327aef31000000000000000000320200000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024f47261b000000000000000000000000086309723166c177591960e5a9a5ecb70565643310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e4a7cb5fb70000000000000000000000003ce63181dc7923811fcb51e00fd946ca69e19164000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const parsedAssetData = ZeroXOrders.parseAssetData(assetData);
    expect(parsedAssetData.market).toEqual('0x11a8877DAdFd7BD46C8462301ecFc989327aEF31');
    expect(parsedAssetData.price).toEqual('0x00');
    expect(parsedAssetData.outcome).toEqual('0x01');
  });
});
