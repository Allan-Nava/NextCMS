/*
 * File: index.tsx
 * Project: next-cms
 * File Created: Wednesday, 13th April 2022 10:08:48 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 13th April 2022 10:08:58 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import { NextPage } from "next";
//
//
const AdminUsers: NextPage = ( { data }: any) => {
    console.log("data ", data);
    return (
      <>Users page admin</>
    )
}
//
export default AdminUsers;