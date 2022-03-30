/* eslint-disable react/jsx-no-target-blank */
import {useState} from 'react'
import {useLayout, ILayout, getLayout, LayoutSetup} from '../../core'
import {AsideMenuItemWithSub} from './AsideMenuItemWithSub'
import {AsideMenuItem} from './AsideMenuItem'

export function AsideMenuMain() {
  const {setLayout} = useLayout()
  const [config, setConfig] = useState<ILayout>(getLayout())
 
  const updateData = (fieldsToUpdate: Partial<ILayout>) => {
    const updatedData = {...config, ...fieldsToUpdate}
    setConfig(updatedData)
    LayoutSetup.setConfig(updatedData)
    setLayout(updatedData)
  }
  

  return (
    <>
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>CONTENT</span>
        </div>
      </div>
      
      <AsideMenuItem
        to='/media'
        icon='/media/icons/duotune/general/gen006.svg'
        title='Media'
        fontIcon='bi-app-indicator'
      />
      
      <AsideMenuItemWithSub fontIcon='bi-archive' icon='/media/icons/duotune/general/gen014.svg' to='/events' title='Events'>
        <AsideMenuItem to='/events/list' title='Events lists' hasBullet={true} />
        <AsideMenuItem to='/events/create' title='Create Event' hasBullet={true} />
      </AsideMenuItemWithSub>
      
      <AsideMenuItemWithSub fontIcon='bi-archive' icon='/media/icons/duotune/general/gen008.svg' to='/rounds' title='Rounds'>
        <AsideMenuItem to='/rounds/list' title='Rounds lists' hasBullet={true} />
        <AsideMenuItem to='/rounds/create' title='Create round' hasBullet={true} />
      </AsideMenuItemWithSub>
      
      <AsideMenuItemWithSub fontIcon='bi-archive' icon='/media/icons/duotune/general/gen013.svg' to='/moments' title='Moments'>
        <AsideMenuItem to='/moments/list' title='Moments lists' hasBullet={true} />
        <AsideMenuItem to='/moments/create' title='Create moment' hasBullet={true} />
      </AsideMenuItemWithSub>

      <div className='menu-item mt-auto'>
        <div className='menu-content'>
          <select
            className='form-select form-select-solid'
            name='layout-builder[layout][aside][theme]'
            value={config.aside.theme}
            onChange={(e) =>
              updateData({
                aside: {
                  ...config.aside,
                  theme: e.target.value as 'dark' | 'light',
                },
              })
            }
          >
            <option value='dark'>Dark</option>
            <option value='light'>Light</option>
          </select>
        </div>
      </div>
    </>
  )
}
