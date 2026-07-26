/*
 * File: roles.tsx
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextPage } from 'next';
import Layout from '../components/admin/common/layout';
import NamedList from '../components/admin/common/NamedList';
import { roles } from '../lib/crud/AdminAPI';
//
// Roles (NC-43).
const RolesPage: NextPage = () => (
    <Layout title='Roles'>
        <NamedList
            heading='Roles'
            list={roles.list}
            create={roles.create}
            remove={roles.remove}
            hint='Roles are stored but do not grant anything yet: authorisation reads the isAdmin and isStaff flags on the user. Tracked as NC-63.'
        />
    </Layout>
);
//
export default RolesPage;
//
