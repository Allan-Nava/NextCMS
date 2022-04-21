export function cleanSlug(slug: string) {
    slug = slug.replace(/^\s+|\s+$/g, '');
    slug = slug.toLowerCase();
  
    const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
    const to = 'aaaaeeeeiiiioooouuuunc------';
  
    for (let i = 0, l = from.length; i < l; i++) {
      slug = slug.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
  
    slug = slug
      .normalize('NFD')
      .replace(/[^a-z0-9 -]^[\u4e00-\u9fa5]/g, '') // remove all that not are a letter, a number, and are not a chinese word
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace('-?', '') 
      .replace('?', '');
  
    return slug;
}
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}