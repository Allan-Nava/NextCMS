/*
 * File: _appstyles.tsx
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 9:19:11 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 9:19:13 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//import publicStyles from '../../../styles/public.scss';
//import adminStyles from '../../../styles/admin.scss';
//
function AdminStyles(): React.ReactElement {
    return <style jsx global></style>;
}
//
function PublicStyles(): React.ReactElement {
return <style jsx global></style>;
}
//
export default function AppStyles({ admin }: { admin: boolean }): React.ReactElement {
    if (admin) { return <AdminStyles />; }
    return <PublicStyles />;
}
//