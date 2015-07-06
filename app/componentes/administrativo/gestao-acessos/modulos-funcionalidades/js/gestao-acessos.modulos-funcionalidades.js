/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-modulos-funcionalidades", ['servicos']) 

.controller("administrativo-modulos-funcionalidadesCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter',
                                            '$autenticacao', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter,$autenticacao){ 
   
    var divPortletBodyModuloFuncionalidadePos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.modulos = [];
    $scope.camposBusca = [{
                            id: $campos.administracao.webpagescontrollers.ds_controller,
                            ativo: true,  
                            nome: "Módulo"
                          }];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.modulo = {busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: $campos.administracao.webpagescontrollers.ds_controller, order : 0}};    
    
    $scope.moduloMenuSelecionado = undefined;     
    $scope.novoModuloMenu = ''; // cadastro
    // flags
    $scope.cadastroNovoModuloMenu = false; // faz exibir a linha para adicionar um novo módulo menu
           
                                                
    // Inicialização do controller
    $scope.administrativoModulosFuncionalidadesInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Módulos e Funcionalidades';
        // Busca módulos
        $scope.buscaModulos();
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
    }; 
                                            
    // ORDENAÇÃO
    /**
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.modulo.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.modulo.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.modulo.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.modulo.campo_ordenacao.order = $scope.modulo.campo_ordenacao.order === 0 ? 1 : 0;                                
            $scope.buscaModulos(); 
        }
    };
    /**
      * Ordena por nome
      */
    $scope.ordena = function(){
        ordena(0);    
    }
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma crescente
      */
    $scope.estaOrdenadoCrescente = function(){
        return $scope.modulo.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.modulo.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma decrescente
      */
    $scope.estaOrdenadoDecrescente = function(){
        return $scope.modulo.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.modulo.campo_ordenacao.order === 1;    
    };                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.modulo.total_paginas){ 
           $scope.modulo.pagina = pagina;
           $scope.buscaModulos(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.modulo.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.modulo.pagina + 1); 
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
        $scope.paginaInformada = $scope.Modulo.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaModulos();   
    };
     
    // BUSCA
    $scope.filtraModulos = function(filtro){
        $scope.modulo.busca = filtro;
        $scope.buscaModulos();
    };
    $scope.buscaModulos = function(){
       $scope.showProgress(divPortletBodyModuloFuncionalidadePos);    
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.modulo.busca.length > 0) filtros = {id: $scope.modulo.campo_busca.id, valor: $scope.modulo.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.grupoempresa){
            var filtroGrupoEmpresa = {id: $campos.administracao.webpagesusers.id_grupo, valor: $scope.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $scope.obtendoModulos = true;
       $webapi.get($apis.administracao.webpagescontrollers, [$scope.token, 2, $scope.modulo.campo_ordenacao.id, 
                                                       $scope.modulo.campo_ordenacao.order, 
                                                       $scope.modulo.itens_pagina, $scope.modulo.pagina],
                   filtros) 
            .then(function(dados){
                $scope.modulos = dados.Registros;
                console.log(dados);
                $scope.modulo.total_registros = dados.TotalDeRegistros;
                $scope.modulo.total_paginas = Math.ceil($scope.modulo.total_registros / $scope.modulo.itens_pagina);
                var registroInicial = ($scope.modulo.pagina - 1)*$scope.modulo.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.modulo.itens_pagina;
                if(registroFinal > $scope.modulo.total_registros) registroFinal = $scope.modulo.total_registros;
                $scope.modulo.faixa_registros =  registroInicial + '-' + registroFinal;
                $scope.obtendoModulos = false;
                $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                // Verifica se a página atual é maior que o total de páginas
                if($scope.modulo.pagina > $scope.modulo.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
              },
              function(failData){
                 $scope.obtendoModulos = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar módulos (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
              }); 
    };
        
                                                                                       
                                                
    // AÇÕES
    /**
      * Exibe cadastro novo módulo menu
      */
    $scope.exibeCadastroNovoModuloMenu = function(exibe){
        $scope.cadastroNovoModuloMenu = exibe === undefined || exibe ? true : false;
        $scope.novoModuloMenu = '';
    }
    /**
      * Adiciona módulo menu
      */
    $scope.addModuloMenu = function(){
        if(!$scope.novoModuloMenu){
           $scope.showAlert('Insira um nome!',true,'danger',true); 
           return;   
        }
        // Envia para o banco
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        $webapi.post($apis.administracao.webpagesroles, $scope.token, {RoleName : $scope.novoModuloMenu})
                .then(function(dados){
                    $scope.showAlert('Módulo cadastrado com sucesso!', true, 'success', true);
                    // Reseta o campo
                    $scope.novoModuloMenu = '';
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao cadastrar o módulo (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  }); 
    }
    /**
      * Exibe as funcionalidades associadas ao módulo
      */
    $scope.exibeFuncionalidades = function(modulo){
        // Reseta permissões
        $scope.permissoes = [];
        $scope.moduloMenuSelecionado = modulo;
        // Exibe o modal
        $('#modalFuncionalidades').modal('show');
        // Carrega as permissões
        obtemMódulosEFuncionalidades();
        
    }; 
    /**
      * Excluir módulo
      */                                            
    var exluirModulo = function(id_controller){
        // Deleta
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        $webapi.delete($apis.administracao.webpagescontrollers,
                       [{id: 'token', valor: $scope.token},{id: 'id_controller', valor: id_controller}])
            .then(function(dados){
                    $scope.showAlert('Módulo deletado com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                    // atualiza tela de módulos
                    $scope.buscaModulos();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao excluir o módulo (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  }); 
    };
    /**
      * Solicitação confirmação para excluir o módulo
      */                                                                              
    $scope.exluirModulo = function(modulo){
        // Envia post para deletar
        $scope.showModal('Confirmação', 
                         'Tem certeza que deseja excluir ' + modulo.ds_controller,
                         exluirModulo, modulo.id_controller,
                         'Sim', 'Não');
    };    
                                                
                                                
    
    // METHODS

}])