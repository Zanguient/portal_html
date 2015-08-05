/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-contas-correntes", []) 

.controller("administrativo-contas-correntesCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [10, 20, 50, 100]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados
    $scope.contas = [];
    $scope.bancos = [];                                             
    $scope.filtro = {itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
    var divPortletBodyContasPos = 0; // posição da div que vai receber o loading progress
    // Modal
    $scope.modalConta = { titulo : '', banco : undefined, buscaBanco : '',
                          nrAgencia : '', nrConta : '', nrCnpj : ''};                                             
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_contasCorrentesInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Contas Corrente';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Avalia grupo empresa
            if($scope.usuariologado.grupoempresa)
                buscaContas();
            else // reseta tudo e não faz buscas 
                $scope.contas = []; 
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Carrega filiais
        if($scope.usuariologado.grupoempresa) buscaContas();
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar contas correntes
      */
    $scope.usuarioPodeCadastrarContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar contas correntes
      */
    $scope.usuarioPodeAlterarContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir contas correntes
      */
    $scope.usuarioPodeExcluirContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoRemocao;
    }                                              
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaContas();
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.setaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        buscaContas();
    }; 
                                                 
            
    
    // BUSCA BANCOS                                             
    $scope.buscaBancos = function(){
      // ....      
    }
                                                 
                                                 
    // BUSCA CONTAS CORRENTES                                                                                     
                                           
    /**
      * Busca Conta Correntes
      */
    var buscaContas = function(){
        
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        
        $scope.showProgress(divPortletBodyContasPos);
        
        // Filtro  
        var filtros = {id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                      valor: $scope.usuariologado.grupoempresa.id_grupo};
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 3, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                // Obtém os dados
                $scope.contas = dados.Registros;
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.contas.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha o progress
                $scope.hideProgress(divPortletBodyContasPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyContasPos);
              });       
    };
                                                 
        
     
    // AÇÕES
    var exibeModalConta = function(){
        $('#modalConta').modal('show');       
    }
                                                 
                                                 
    /**
      * Exibe o input para cadastro de nova conta
      */
    $scope.novaConta = function(){
        $scope.modalConta.titulo = 'Nova Conta em ' + $scope.usuariologado.grupoempresa.ds_nome.toUpperCase();
        $scope.modalConta.buscaBanco = '';
        $scope.modalConta.banco = undefined;
        $scope.modalConta.nrAgencia = '';
        $scope.modalConta.nrConta = '';
        $scope.modalConta.nrCnpj = '';
        // Exibe o modal
        exibeModalConta();
    };
                                                 
    
    /**
      * Salva os dados de acesso
      * /                                              
    $scope.salvarConta = function(){
       if(!validaDadoAcesso()) return;    
       // Cadastra
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyDadosPos);
       var jsonDadoAcesso = {
           login : $scope.cadastro.login,
           senha : $scope.cadastro.senha,
           cnpj : $scope.filtro.filial.nu_cnpj,
           idGrupo : $scope.usuariologado.grupoempresa.id_grupo,
           estabelecimento : $scope.cadastro.estabelecimento ? $scope.cadastro.estabelecimento : null, 
           operadora : { nmOperadora : $scope.cadastro.adquirente.descricao }
       };
       //console.log(jsonDadoAcesso);
       $webapi.post($apis.getUrl($apis.pos.loginoperadora, undefined,
                                 {id : 'token', valor : $scope.token}), jsonDadoAcesso) 
            .then(function(dados){           
                $scope.showAlert('Cadastrado com sucesso!', true, 'success', true);
                // Esconde a linha
                $scope.exibePrimeiraLinha = false;
                // Relista
                buscaDadosDeAcesso(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao realizar o cadastro (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyDadosPos);
              });    
    };
    /**
      * Altera o dado de acesso
      * /
    $scope.editarConta = function(dadoacesso){
        // ...        
    };
    /**
      * Cancela a alteração
      * /                                             
    $scope.alteraConta = function(old){
       if(typeof old === 'undefined') return; 
       // Verifica se houve alteração
       if(old.login === $scope.alteracao.login &&
          old.senha === $scope.alteracao.senha &&
          (old.estabelecimento === null && !$scope.alteracao.estabelecimento || 
           old.estabelecimento === $scope.alteracao.estabelecimento)){
            $scope.cancelaAlteracao();
            return;
       }
        
       if($scope.alteracao.login.trim().length < 3){
           $scope.showModalAlerta('Preencha um login com no mínimo 3 caracteres!');
           return false;
       }
       if($scope.alteracao.senha.trim().length < 3){
           $scope.showModalAlerta('Preencha uma senha com no mínimo 3 caracteres!');
           return false;
       }
       // Altera
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyDadosPos);
       var jsonDadoAcesso = {
           id : $scope.alteracao.id,
           login : $scope.alteracao.login,
           senha : $scope.alteracao.senha,
           estabelecimento : $scope.alteracao.estabelecimento ? $scope.alteracao.estabelecimento : null
       };
       //console.log(jsonDadoAcesso);
       $webapi.update($apis.getUrl($apis.pos.loginoperadora, undefined,
                                   {id : 'token', valor : $scope.token}), jsonDadoAcesso) 
            .then(function(dados){           
                $scope.showAlert('Alterado com sucesso!', true, 'success', true);
                // Esconde a linha
                $scope.cancelaAlteracao();
                // Relista
                buscaDadosDeAcesso(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao atualizar os dados (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyDadosPos);
              }); 
    };*/
    $scope.excluirConta = function(conta){
        // ...    
    };                                             
    $scope.filiaisVinculadas = function(conta){
        // ...    
    };
    
}]);