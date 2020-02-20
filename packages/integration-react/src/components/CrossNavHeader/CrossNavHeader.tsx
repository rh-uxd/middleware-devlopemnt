import * as React from 'react';
import styles from '@patternfly/react-styles/css/components/Page/page';
import { css } from '@patternfly/react-styles';
import { BarsIcon } from '@patternfly/react-icons';
import { Button, ButtonVariant, PageHeaderProps, PageContextConsumer } from '@patternfly/react-core';
import { CrossNavApp, getAppNavState, setAppNavState, navigateToApp } from '@rh-uxd/integration-core';
import { CrossNavContextSelector, CrossNavContextSelectorItem } from '../CrossNavContextSelector';

export type CrossNavAppState = {
  /** The current URL (including any parameters) that user navigated too. */
  currentURL: string; 
  /** An object that contains any state data that is need to restore the current application state.  */
  stateData: any;
}

export interface CrossNavHeaderProps extends PageHeaderProps {
  /** Application data for applications shown in the cross console navigation.  Note if a protocol is not specified to use when navigating for an app, it will default to https*/
  apps: CrossNavApp[];
  currentApp: CrossNavApp;
  onAppNavigate?: (app: CrossNavApp
    ) => void;
}

interface CrossNavHeaderState {
  readonly isOpen: boolean;
  readonly initalLoad: boolean;
}

export class CrossNavHeader extends React.Component<CrossNavHeaderProps, CrossNavHeaderState> {
  
  constructor(props: CrossNavHeaderProps) {
    super(props);
    this.state = {
      isOpen: false,
      initalLoad: true
    }
  }
  /** 
   * Writes last known URL and state data for a user of a specific app to local storage.
   * 
   * @param appId - Uniquie identifer for application
   * @param userId - Uniquie identifer for the user.  Defaults to no user.
   * @param appState - Object containing the current state of the application.
   */
  static setAppNavState(appId: string, userId: string = '', appState: CrossNavAppState) {
    setAppNavState(appId, userId, appState);
  }

  /**
   * Retrieves the last known URL and state date for the user of the specified app.
   * 
   * @param appId - Uniquie identifer for application
   * @param userId - Uniquie identifer for the user.  Defaults to no user.
   * 
   * @returns Saved application state retrieved from local storage.
   */
   static getAppNavState(appId: string, userId: string = ''): CrossNavAppState {
     return getAppNavState(appId, userId);
  }

  private onToggle = (event: any, isOpen: boolean) => {
    this.setState({
      isOpen
    });
  };

  private onSelect = (event: any, app: CrossNavApp) => {
    if (this.props.onAppNavigate) {
      this.props.onAppNavigate(app);
    }
    this.setState({
      isOpen: !this.state.isOpen
    });
    navigateToApp(this.props.currentApp, app);
  }

  render() {

    const { apps = null as CrossNavApp[],
      currentApp,
      className = '',
      logo = null as React.ReactNode,
      logoProps = null as object,
      logoComponent = 'a',
      toolbar = null as React.ReactNode,
      avatar = null as React.ReactNode,
      topNav = null as React.ReactNode,
      isNavOpen = true,
      showNavToggle = false,
      onNavToggle = () => undefined as any,
      'aria-label': ariaLabel = 'Global navigation',
      ...props } = this.props;

    const LogoComponent = logoComponent as any;

    const {
      isOpen
    } = this.state;

    return (
      <PageContextConsumer>
        {({ isManagedSidebar, onNavToggle: managedOnNavToggle, isNavOpen: managedIsNavOpen }: PageHeaderProps) => {
          const navToggle = isManagedSidebar ? managedOnNavToggle : onNavToggle;
          const navOpen = isManagedSidebar ? managedIsNavOpen : isNavOpen;

          return (
            <header role="banner" className={css(styles.pageHeader, className)} {...props}>
              {(showNavToggle || logo) && (
                <div className={css(styles.pageHeaderBrand)}>
                  {showNavToggle && (
                    <div className={css(styles.pageHeaderBrandToggle)}>
                      <Button
                        id="nav-toggle"
                        onClick={navToggle}
                        aria-label={ariaLabel}
                        aria-controls="page-sidebar"
                        aria-expanded={navOpen ? 'true' : 'false'}
                        variant={ButtonVariant.plain}
                      >
                        <BarsIcon />
                      </Button>
                    </div>
                  )}
                  {logo && (
                    <LogoComponent className={css(styles.pageHeaderBrandLink)} {...logoProps}>
                      {logo}
                    </LogoComponent>
                  )}
                </div>
              )}
              {<CrossNavContextSelector 
                  toggleText = {currentApp.name} 
                  onToggle={this.onToggle}
                  onSelect={this.onSelect}
                  isOpen={isOpen}
                  >
                    {
                      apps.map((app: CrossNavApp) => (<CrossNavContextSelectorItem key={app.id} app={app}>{app.name}</CrossNavContextSelectorItem>))
                    }
                </CrossNavContextSelector>
                }
              {topNav && <div className={css(styles.pageHeaderNav)}>{topNav}</div>}
              {(toolbar || avatar) && (
                <div className={css(styles.pageHeaderTools)}>
                  {toolbar}
                  {avatar}
                </div>
              )}
            </header>
          );
        }}
      </PageContextConsumer>
    );
  }
};