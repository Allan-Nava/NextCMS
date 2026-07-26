/*
 * File: taxonomies.tsx
 * Project: next-admin
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import type { NextPage } from 'next';
import Layout from '../components/admin/common/layout';
import NamedList from '../components/admin/common/NamedList';
import { categories, tags } from '../lib/crud/AdminAPI';
//
// Categories and tags (NC-43). Slugs are derived from the name by the API, so this
// screen never asks for one.
const TaxonomiesPage: NextPage = () => (
    <Layout title='Categories & tags'>
        <NamedList heading='Categories' list={categories.list} create={categories.create} remove={categories.remove} showSlug />
        <NamedList
            heading='Tags'
            list={tags.list}
            create={tags.create}
            remove={tags.remove}
            showSlug
            hint='Tags are also created automatically when an editor types a new one on a content item.'
        />
    </Layout>
);
//
export default TaxonomiesPage;
//
