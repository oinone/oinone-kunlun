export const DefaultMask = `<mask>
    <multi-tabs />
    <header>
        <widget widget="app-switcher" />
        <block>
            <widget widget="notification" />
            <widget widget="divider" />
            <widget widget="language" />
            <widget widget="divider" />
            <widget widget="user" />
        </block>
    </header>
    <container>
        <sidebar>
            <widget widget="nav-menu" height="100%" />
        </sidebar>
        <content>
            <breadcrumb />
            <block width="100%">
                <widget width="100%" widget="main-view" />
            </block>
        </content>
    </container>
</mask>`;

export const InlineMultiTabsMaskXML = `<mask>
    <header>
        <widget widget="app-switcher" />
        <block>
            <widget widget="notification" />
            <widget widget="divider" />
            <widget widget="language" />
            <widget widget="divider" />
            <widget widget="user" />
        </block>
    </header>
    <container>
        <sidebar>
            <widget widget="nav-menu" height="100%" />
        </sidebar>
        <block height="100%" flex="1 0 0" flexDirection="column" alignContent="flex-start" flexWrap="nowrap" overflow="hidden">
            <multi-tabs inline="true" />
            <content>
                <breadcrumb />
                <block width="100%">
                    <widget width="100%" widget="main-view" />
                </block>
            </content>
        </block>
    </container>
</mask>`;
