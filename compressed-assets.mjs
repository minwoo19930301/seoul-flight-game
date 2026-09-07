export async function loadCompressedJson(url){
  const response=await fetch(url);if(!response.ok)throw Error(`자료 로딩 실패 (${response.status}): ${url}`);
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(bytes[0]!==0x1f||bytes[1]!==0x8b)return JSON.parse(new TextDecoder().decode(bytes));
  if(typeof DecompressionStream==='undefined')throw Error('압축 지도 자료를 읽을 수 있는 최신 브라우저가 필요합니다.');
  return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json();
}
