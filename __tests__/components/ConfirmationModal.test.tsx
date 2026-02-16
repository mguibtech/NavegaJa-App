/**
 * @format
 */

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ThemeProvider} from '@shopify/restyle';

import {ConfirmationModal} from '../../src/components/ConfirmationModal/ConfirmationModal';
import {theme} from '../../src/theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ConfirmationModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when visible', () => {
    const {getByText} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Confirmar Ação"
        message="Tem certeza que deseja continuar?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(getByText('Confirmar Ação')).toBeTruthy();
    expect(getByText('Tem certeza que deseja continuar?')).toBeTruthy();
    expect(getByText('Confirmar')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('should not render modal when not visible', () => {
    const {queryByText} = renderWithTheme(
      <ConfirmationModal
        visible={false}
        title="Confirmar Ação"
        message="Tem certeza que deseja continuar?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(queryByText('Confirmar Ação')).toBeNull();
  });

  it('should call onConfirm when confirm button is pressed', () => {
    const {getByText} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Confirmar Ação"
        message="Tem certeza?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText('Confirmar'));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const {getByText} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Confirmar Ação"
        message="Tem certeza?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText('Cancelar'));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should render custom button texts', () => {
    const {getByText} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Deletar Item"
        message="Esta ação não pode ser desfeita"
        confirmText="Sim, deletar"
        cancelText="Não, voltar"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(getByText('Sim, deletar')).toBeTruthy();
    expect(getByText('Não, voltar')).toBeTruthy();
  });

  it('should show loading state on confirm button', () => {
    const {queryByText, UNSAFE_getAllByType} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Processando"
        message="Aguarde..."
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isLoading={true}
      />,
    );

    // Quando loading, o texto do botão não aparece
    expect(queryByText('Confirmar')).toBeNull();

    // Deve mostrar ActivityIndicator
    const activityIndicators = UNSAFE_getAllByType('ActivityIndicator' as any);
    expect(activityIndicators.length).toBeGreaterThan(0);
  });

  it('should disable cancel button when loading', () => {
    const {getByText} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Processando"
        message="Aguarde..."
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isLoading={true}
      />,
    );

    // Botão cancelar deve estar desabilitado quando loading
    fireEvent.press(getByText('Cancelar'));
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should render with different icon colors', () => {
    const iconColors: Array<'primary' | 'success' | 'warning' | 'danger' | 'info'> = [
      'primary',
      'success',
      'warning',
      'danger',
      'info',
    ];

    iconColors.forEach(color => {
      const {getByText} = renderWithTheme(
        <ConfirmationModal
          visible={true}
          title="Test"
          message="Test message"
          iconColor={color}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(getByText('Test')).toBeTruthy();
    });
  });

  it('should render with custom icon', () => {
    const {getByText} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Deletar"
        message="Tem certeza?"
        icon="delete"
        iconColor="danger"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(getByText('Deletar')).toBeTruthy();
  });

  it('should render with different confirm button preset', () => {
    const {getByText} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Ação Importante"
        message="Prosseguir?"
        confirmPreset="outline"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(getByText('Confirmar')).toBeTruthy();
  });

  it('should use default values for optional props', () => {
    const {getByText} = renderWithTheme(
      <ConfirmationModal
        visible={true}
        title="Default Props"
        message="Testing defaults"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    // Deve usar textos padrão
    expect(getByText('Confirmar')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });
});
