import React from 'react';

interface LayoutProps {
  header: React.ReactNode;
  content: React.ReactNode;
  sidebar?: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { header, sidebar, content } = props;

  return (
    <section className="main-wrapper">
      <header className="layout-header header">{header}</header>
      <section className={`wrapper ${sidebar ? 'layout-has-sidebar' : ''}`}>
        {sidebar && (
          <aside className="layout-sidebar">
            <div className="layout-sidebar-children">{sidebar}</div>
          </aside>
        )}
        <section className="content">
          <main className="layout-content">{content}</main>
        </section>
      </section>
    </section>
  );
};

export default Layout;
