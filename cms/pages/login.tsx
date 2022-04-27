/*
 * File: login.tsx
 * Project: next-cms
 * File Created: Tuesday, 26th April 2022 10:57:59 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 27th April 2022 7:43:17 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as Yup from 'yup'
import clsx from 'clsx'
import { actions } from '../lib/reducers/auth/reducer'
import { useFormik } from 'formik'
import { login } from '../lib/crud/AuthCRUD'
//
//
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
});
//
const initialValues = {
  email: '',
  password: '',
}
//
//
const Login = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setLoading(true)
      setTimeout(() => {
        login(values.email, values.password)
          .then(({ data: { data: { access_token, refresh_token } } }) => {

            setLoading(false)
            setSubmitting(false)
            dispatch(actions.login(access_token, refresh_token))
          })
          .catch(() => {
            setLoading(false)
            setSubmitting(false)
            setStatus('The login detail is incorrect')
          })
      }, 1000)
    },
  })

  return <div className='d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed'>
    <div className='d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20'>
      <div className='w-lg-500px bg-white rounded shadow-sm p-10 p-lg-15 mx-auto'>
        <form
          className='form w-100'
          onSubmit={formik.handleSubmit}
          noValidate
          id='kt_login_signin_form'
        >
          <div className='text-center mb-10'>
            <h1 className='text-dark mb-3'>Sign In</h1>
          </div>

          {formik.status ? (
            <div className='mb-lg-15 alert alert-danger'>
              <div className='alert-text font-weight-bold'>{formik.status}</div>
            </div>
          ) :
            ""
          }
          <div className='fv-row mb-10'>
            <label className='form-label fs-6 fw-bolder text-dark'>Email</label>
            <input
              placeholder='Email'
              {...formik.getFieldProps('email')}
              className={clsx(
                'form-control form-control-lg form-control-solid',
                { 'is-invalid': formik.touched.email && formik.errors.email },
                {
                  'is-valid': formik.touched.email && !formik.errors.email,
                }
              )}
              type='email'
              name='email'
              autoComplete='off'
            />
            {formik.touched.email && formik.errors.email && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{formik.errors.email}</span>
              </div>
            )}
          </div>
          <div className='fv-row mb-10'>
            <div className='d-flex justify-content-between mt-n5'>
              <div className='d-flex flex-stack mb-2'>
                <label className='form-label fw-bolder text-dark fs-6 mb-0'>Password</label>
              </div>
            </div>
            <input
              type='password'
              autoComplete='off'
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control form-control-lg form-control-solid',
                {
                  'is-invalid': formik.touched.password && formik.errors.password,
                },
                {
                  'is-valid': formik.touched.password && !formik.errors.password,
                }
              )}
            />
            {formik.touched.password && formik.errors.password && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.password}</span>
                </div>
              </div>
            )}
          </div>
          <div className='text-center'>
            <button
              type='submit'
              id='kt_sign_in_submit'
              className='btn btn-lg btn-primary w-100 mb-5'
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {!loading && <span className='indicator-label'>Continue</span>}
              {loading && (
                <span className='indicator-progress' style={{ display: 'block' }}>
                  Please wait...
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
}
//
export default Login;
//