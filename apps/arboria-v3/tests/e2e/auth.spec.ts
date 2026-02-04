import { test, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';

test.describe('Authentication Flow', () => {
    test('should show login page and toggle to signup', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await expect(loginPage.header).toHaveText('Bem-vindo de volta');
        await expect(loginPage.emailInput).toBeVisible();

        await loginPage.toggleSignup();
        await expect(loginPage.header).toHaveText('Criar nova conta');

        await loginPage.toggleSignup();
        await expect(loginPage.header).toHaveText('Bem-vindo de volta');
    });

    test('should show error with invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await loginPage.login('invalid@example.com', 'wrongpassword');

        // Expected toast or error message (Sonner toast is usually in the DOM)
        // We can check for the toast content if it's rendered in a standard way
        await expect(page.getByText('Erro ao realizar login')).toBeVisible();
    });
});
