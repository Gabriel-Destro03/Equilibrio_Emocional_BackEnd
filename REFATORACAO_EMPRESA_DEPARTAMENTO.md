# Refatoração das Camadas de Empresa e Departamento

## Melhorias Implementadas

### 1. Interfaces Implementadas

#### IService (Interface Base)
- Define métodos CRUD padrão: `getAll()`, `getById()`, `create()`, `update()`, `inactivate()`, `changeStatus()`
- Garante consistência na implementação de todos os services

#### IEmpresaService
- Estende `IService` com métodos específicos de empresa
- Métodos adicionais:
  - `getByCnpj(cnpj)` - Busca empresa por CNPJ
  - `getRepresentantesByEmpresaId(empresaId)` - Busca representantes
  - `getEmpresaFiliaisDepartamentos()` - Estrutura hierárquica completa
  - `validateEmpresaData(empresaData, isUpdate)` - Validação centralizada
  - `manageRepresentantes(empresaId, representantes)` - Gerenciamento de representantes

#### IDepartamentoService
- Estende `IService` com métodos específicos de departamento
- Métodos adicionais:
  - `getDepartamentosByFilial(filialId)` - Busca por filial
  - `getByEmpresaId(empresaId)` - Busca por empresa
  - `validateDepartamentoData(departamentoData, isUpdate)` - Validação centralizada
  - `validateFilialBelongsToEmpresa(filialId, empresaId)` - Validação de relacionamento

### 2. Padrão Facade Implementado

#### EmpresaDepartamentoFacade
Centraliza operações complexas que envolvem múltiplos services:

- **`getEstruturaHierarquica(empresaId?)`**:
  - Busca estrutura completa: empresa → filiais → departamentos
  - Suporte para empresa específica ou todas as empresas
  - Processamento assíncrono otimizado

- **`criarDepartamentoComValidacao(departamentoData, empresaId)`**:
  - Valida se a filial pertence à empresa antes de criar
  - Usa validação centralizada do service

- **`getDepartamentosByEmpresaWithDetails(empresaId)`**:
  - Busca departamentos com informações completas da filial
  - Retorna estrutura enriquecida

- **`validarEstruturaEmpresa(empresaId)`**:
  - Validação completa da estrutura da empresa
  - Retorna contadores e informações organizadas

### 3. Refatorações nos Services

#### EmpresaService
- **Antes**: Lógica duplicada e validações espalhadas
- **Depois**: 
  - Implementa `IEmpresaService`
  - Métodos de validação centralizados (`validateEmpresaData`)
  - Gerenciamento de representantes simplificado (`manageRepresentantes`)
  - Uso do Facade para operações hierárquicas

#### DepartamentoService
- **Antes**: Validações básicas e lógica repetitiva
- **Depois**:
  - Implementa `IDepartamentoService`
  - Validação centralizada (`validateDepartamentoData`)
  - Validação de relacionamentos (`validateFilialBelongsToEmpresa`)
  - Métodos preparados para uso no Facade

### 4. Melhorias nos Controllers

#### DepartamentoController
- Uso do Facade para operações complexas
- Novos endpoints que demonstram o poder do Facade:
  - `criarDepartamentoComValidacao` integrado no store
  - `getDepartamentosByEmpresaWithDetails` - endpoint novo
  - `validarEstruturaEmpresa` - endpoint novo

## Benefícios Alcançados

### 1. **Redução de Código Duplicado**
- Validações centralizadas nos services
- Lógica de relacionamentos no Facade
- Métodos reutilizáveis entre diferentes contexts

### 2. **Melhor Manutenibilidade**
- Interfaces garantem contratos claros
- Facade simplifica operações complexas
- Separação de responsabilidades mais clara

### 3. **Maior Flexibilidade**
- Services podem ser facilmente estendidos
- Facade permite composição de operações
- Novos endpoints podem aproveitar funcionalidades existentes

### 4. **Testabilidade Melhorada**
- Interfaces facilitam mocking
- Facade permite testar operações complexas isoladamente
- Validações centralizadas são mais fáceis de testar

## Exemplos de Uso

### Usando o Facade diretamente:
```javascript
const facade = new EmpresaDepartamentoFacade()
facade.initializeServices(empresaService, departamentoService, filialService)

// Buscar estrutura hierárquica completa
const estrutura = await facade.getEstruturaHierarquica()

// Criar departamento com validação
const departamento = await facade.criarDepartamentoComValidacao(dadosDepartamento, empresaId)
```

### Implementando novos services:
```javascript
class NovoService extends IService {
    // Implementação obrigatória dos métodos da interface
    async getAll() { /* implementação */ }
    async getById(id) { /* implementação */ }
    // ... outros métodos
}
```

## Próximos Passos Sugeridos

1. **Aplicar o mesmo padrão** para outras camadas (FilialService, UsuarioService, etc.)
2. **Criar Facades específicos** para outras operações complexas
3. **Implementar validações** usando bibliotecas como Joi ou Yup
4. **Adicionar testes unitários** para as interfaces e Facade
5. **Documentar** as interfaces com JSDoc mais detalhado
