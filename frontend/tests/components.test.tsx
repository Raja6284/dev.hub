import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from '../src/store';
import AuthForm from '../src/components/AuthForm';
import ProfileWizard from '../src/components/ProfileWizard';
import PostFeed from '../src/components/PostFeed';
import CommentThread from '../src/components/CommentThread';
import BookmarkList from '../src/components/BookmarkList';

test('renders AuthForm', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <AuthForm />
      </BrowserRouter>
    </Provider>,
  );
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
});

test('renders ProfileWizard', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <ProfileWizard />
      </BrowserRouter>
    </Provider>,
  );
  expect(screen.getByText(/Profile Setup/)).toBeInTheDocument();
});

test('renders PostFeed', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <PostFeed />
      </BrowserRouter>
    </Provider>,
  );
  expect(screen.getByPlaceholderText('Post Title')).toBeInTheDocument();
});

test('renders CommentThread', () => {
  const comment = { _id: '1', text: 'Test comment', user: 'user1', replies: [] };
  render(
    <Provider store={store}>
      <BrowserRouter>
        <CommentThread comment={comment} postId="post1" onComment={() => {}} />
      </BrowserRouter>
    </Provider>,
  );
  expect(screen.getByText('Test comment')).toBeInTheDocument();
});

test('renders BookmarkList', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <BookmarkList />
      </BrowserRouter>
    </Provider>,
  );
  expect(screen.getByText('Trending Repos')).toBeInTheDocument();
});